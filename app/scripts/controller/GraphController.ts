import {
    GeneralPath,
    GraphComponent,
    IGraph,
    IModelItem,
    INode,
    INodeMap,
    Maps,
    YNodeList,
    YPoint,
    YRectangle
} from 'yfiles'

import {GraphIO} from "./GraphIO";
import {ILiteEvent, LiteEvent} from "../utils/liteevent";
import {GraphLabel} from "../view/GraphLabel";
import {GraphLayoutManager} from "../view/GraphLayoutManager";
import {GraphStyle} from "../view/GraphStyle";
import {KGraph} from "../model/KGraph";
import {SimplyConnectedGraph} from "../model/subgraph/SimplyConnectedGraph";
import {layoutTarget, layoutType} from "../view/GraphLayout";
import {LabelGraph} from "../model/subgraph/LabelGraph";
import {GroupGraph} from "../model/subgraph/GroupGraph";
import {IndividualsGraph} from "../model/subgraph/IndividualsGraph";
import {MaleGraph} from "../model/subgraph/MaleGraph";
import {FemaleGraph} from "../model/subgraph/FemaleGraph";
import {OthersGraph} from "../model/subgraph/OthersGraph";
import { KNode } from '../model/KNode';
import {SweepLine} from "../algorithm/SweepLine";
import Papa from 'papaparse';
import {KEdge} from "../model/KEdge";
import LimitedRectangleDescriptor from "../model/subgraph/LimitedRectangleDescriptor";

export class GraphController{

    graphComponent: GraphComponent;

    graphIO: GraphIO;

    private readonly onGraphLoad:LiteEvent<boolean>; //true if file has been imported
    private readonly onGraphUpdated:LiteEvent<null>;
    private readonly onItemsOfInterestChanged:LiteEvent<null>;

    kGraph: KGraph
    currentGraph: SimplyConnectedGraph

    graphStyle: GraphStyle
    graphLabel: GraphLabel
    graphLayoutManager: GraphLayoutManager

    expansionList : YNodeList
    expansionSet : INodeMap

    previousState: YNodeList

    backup: IGraph

    itemsOfInterest : KNode[]

    sweepLine: SweepLine

    constructor(graphComponent:GraphComponent){

        this.graphComponent = graphComponent;

        this.onGraphLoad = new LiteEvent();
        this.onGraphUpdated = new LiteEvent();
        this.onItemsOfInterestChanged = new LiteEvent();
        this.graphIO = new GraphIO(this.graphComponent);

        this.graphStyle = new GraphStyle(graphComponent);
        this.graphLayoutManager = new GraphLayoutManager(graphComponent);

        this.expansionList = new YNodeList();
        this.expansionSet = Maps.createHashedNodeMap();
        this.backup = this.graphComponent.graph;

        this.itemsOfInterest = [];
        this.sweepLine = new SweepLine();
    }

    public get GraphLoaded():ILiteEvent<boolean> {
        return this.onGraphLoad.expose();
    }

    public get GraphUpdated():ILiteEvent<null> {
        return this.onGraphUpdated.expose();
    }

    public get ItemsOfInterestChanged():ILiteEvent<null> {
        return this.onItemsOfInterestChanged.expose();
    }

    initialize(){
        this.graphIO.importFromCSV();
        this.kGraph = new KGraph(this.graphIO);
        this.graphLabel = new GraphLabel(this.graphComponent,this.kGraph);
        this.onGraphLoad.trigger(false);
    }

    clearExpansions(){

        this.expansionList.clear();
        this.expansionSet = Maps.createHashedNodeMap();
    }

    expandNode(modelItem: IModelItem) {

        if (this.kGraph.vertexList[modelItem.tag] == undefined) {
            return
        }

        let allNodes = this.graphComponent.graph.nodes.toList();

        //this.previousState = new YNodeList();
        //this.previousState.addAll(allNodes);

        let currentID = modelItem.tag
        let currentVertex = this.kGraph.vertexID[currentID];
        let nodes = this.graphComponent.graph.nodes;

        let neighbourhoodVertex = this.currentGraph.backup.neighbors(currentVertex);

        let newSet = new YNodeList();

        if( this.expansionList.includes(currentVertex)){

            this.expansionList.remove(currentVertex);
            let verticesToRemove = <YNodeList> this.expansionSet.get(currentVertex);

            nodes.forEach(currentV =>{
                if( !verticesToRemove.includes(currentV)){
                    newSet.addFirst(currentV);
                }
            });

            verticesToRemove.clear();
            this.expansionSet.set(currentVertex,verticesToRemove);
        }
        else{
            this.expansionList.addFirst(currentVertex);

            let expansion = new YNodeList();

            neighbourhoodVertex.forEach(currentNeighbour =>{
                if( ! nodes.includes(currentNeighbour)){
                    expansion.addFirst(currentNeighbour);
                }
            });
            this.expansionSet.set(currentVertex,expansion);

            nodes.forEach(currentV =>{
                newSet.addFirst(currentV);
            });


            expansion.forEach(currentV =>{
                newSet.addFirst(currentV);
            })
        }


         this.currentGraph.remap(newSet);
         this.update();

    }

    update(){
        let layoutType = this.graphLayoutManager.currentLayout;
        let layoutTarget = this.graphLayoutManager.currentTarget;
        this.graphLayoutManager.applyLayout(layoutType,layoutTarget);

        this.graphStyle.update(this.kGraph);
        this.graphLabel.reset();
        this.graphLabel.update();
        this.graphComponent.fitContent();
        this.onGraphUpdated.trigger();
    }

    getComponents(): string[] {
        let res = [];
        for( let i = 1; i < 51; i++){
            res.push(i);
        }
        return res;
    }

    getItemsOfInterest(): KNode[] {
        return this.itemsOfInterest;
    }


    removeNodesNotInArea(selectionPath: GeneralPath) {
        let newSet = new YNodeList();
        this.graphComponent.graph.nodes.toList().forEach((n) => {
            if (selectionPath.areaContains(n.layout.center)) {
            newSet.addFirst(n);
            }
        })
        this.currentGraph.remap(newSet);

        let allNodes = this.graphComponent.graph.nodes.toList();
        this.previousState = new YNodeList();
        this.previousState.addAll(allNodes);
        console.log("SIZE: ",this.previousState.nodes().size);

        this.update();

        this.clearExpansions();
    }


    showGraph(target: layoutTarget ,numComps: number) {
        if (target != undefined) {
            switch (target) {
                case layoutTarget.labelsLayout:
                    this.currentGraph = new LabelGraph(this.graphComponent, this.kGraph, numComps);
                    break;
                case layoutTarget.groupsLayout:
                    this.currentGraph = new GroupGraph(this.graphComponent, this.kGraph, numComps);
                    break;
                case layoutTarget.individualsLayout:
                    this.currentGraph = new IndividualsGraph(this.graphComponent, this.kGraph, numComps);
                    break;
                case layoutTarget.maleLayout:
                    this.currentGraph = new MaleGraph(this.graphComponent, this.kGraph, numComps);
                    break;
                case layoutTarget.femaleLayout:
                    this.currentGraph = new FemaleGraph(this.graphComponent, this.kGraph, numComps);
                    break;
                case layoutTarget.othersLayout:
                    let other = new OthersGraph(this.graphComponent, this.kGraph, numComps);
                    break;
                case layoutTarget.allLayout:
                    this.currentGraph = new SimplyConnectedGraph(this.graphComponent, this.kGraph);
            }
            this.clearExpansions();
            this.update();
        }
    }

    resetGraph(){

        let resultSet = new YNodeList();
        let currentTarget = this.graphLayoutManager.currentTarget;

        switch( currentTarget){
            case layoutTarget.allLayout:
                let currentListAll = this.currentGraph.allSet.toList();
                resultSet.addAll(currentListAll);
                break;
            case layoutTarget.labelsLayout:
                let currentListLabels = this.currentGraph.labelSet.toList();
                resultSet.addAll(currentListLabels);
                break;
            case layoutTarget.femaleLayout:
                let currentListFemale = this.currentGraph.femaleSet.toList();
                resultSet.addAll(currentListFemale);
                break;
            case layoutTarget.groupsLayout:
                let currentListGroups = this.currentGraph.groupSet.toList();
                resultSet.addAll(currentListGroups);
                break;
            case layoutTarget.individualsLayout:
                let currentListIndividuals = this.currentGraph.individualsSet.toList();
                resultSet.addAll(currentListIndividuals);
                break;
            case layoutTarget.maleLayout:
                let currentListMale = this.currentGraph.maleSet.toList();
                resultSet.addAll(currentListMale);
                break;
            case layoutTarget.othersLayout:
                let currentListOthers = this.currentGraph.othersSet.toList();
                resultSet.addAll(currentListOthers);
                break;

        }
        this.currentGraph.remap(resultSet);
        this.update();
        this.clearExpansions();
    }

    addNodeWithID(knodeID: number) {
        let newSet = new YNodeList();
        this.graphComponent.graph.nodes.toList().forEach((n) => {
            newSet.addFirst(n);
        })

        // find and add node to new set
        let node = this.kGraph.vertexID[knodeID]
        if(node != undefined){
            newSet.add(node);
        }
        this.currentGraph.remap(newSet);
        this.update();
    }

    addToItemsOfInterest(knodeID: number) {
        let knode = this.kGraph.vertexList.find(knode => knode.id == knodeID);
        if(knode != null){
            this.itemsOfInterest.push(knode)
            this.onItemsOfInterestChanged.trigger();
        }
    }

    displayOnlyItemsOfInterest() {
        let newSet = new YNodeList();
        this.itemsOfInterest.forEach((knode) => {
            newSet.add(this.kGraph.vertexID[knode.id])
        })
        this.currentGraph.remap(newSet);
        this.update();
    }

    exportLayoutCSV(){

        let resultCSV = 'id,x,y\n';

        this.graphComponent.graph.nodes.forEach(currentNode =>{

            let currentID = this.kGraph.vertexMAP.get(currentNode);
            let currentX = currentNode.layout.x;
            let currentY = currentNode.layout.y;

            resultCSV += (currentID + "," + currentX+ "," + currentY+"\n");
        });

        resultCSV = resultCSV.substr(0,resultCSV.length-1);
        this.graphIO.download("LAYOUT.csv",resultCSV);
    }

    importLayoutCSV2(){
        let layoutURL = "http://localhost:9003/csv/optimizedGenetic.csv";
        let first = true;
        Papa.parse(layoutURL, {
            download: true,
            skipEmptyLines: true,
            step: (row) => {
                let node_id: number = parseInt(row.data[0])
                let node_x: number = parseInt(row.data[1])
                let node_y: number = parseInt(row.data[2])

                if ( first ) {
                    first = false;
                }
                else{
                    let node = this.kGraph.vertexID[node_id];
                    this.graphComponent.graph.setNodeCenter(node, new YPoint(node_x, node_y).toPoint())
                }
            }
        });
    }


    importLayoutCSV(){
        for( let row=0; row < 14; row++) {
            for (let col = 0; col < 14; col++) {
                let currentRect = new YRectangle(col * 200, (row + 1) * 200, 200, 200);
                this.graphComponent.highlightGroup.addChild(currentRect, new LimitedRectangleDescriptor());
            }
        }

        let layoutURL = "http://localhost:9003/csv/LAYOUT.csv";
        let first = true;
        Papa.parse(layoutURL, {
            download: true,
            skipEmptyLines: true,
            step: (row) => {
                let node_id: number = parseInt(row.data[0])
                let node_x: number = parseInt(row.data[1])
                let node_y: number = parseInt(row.data[2])

                if ( first ) {
                    first = false;
                }
                else{
                    let node = this.kGraph.vertexID[node_id];
                    this.graphComponent.graph.setNodeCenter(node, new YPoint(node_x, node_y).toPoint())
                }
            }
        });
    }


}

