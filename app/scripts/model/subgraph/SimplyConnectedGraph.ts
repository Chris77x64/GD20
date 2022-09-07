import {
    FilteredGraphWrapper,
    GraphComponent, IGraph,
    YNodeList
} from 'yfiles'

import {SimpleConnectedComponents} from "../../algorithm/SimpleConnectedComponents";
import {KGraphInduced} from "../KGraphInduced";
import {KGraph} from "../KGraph";

export class SimplyConnectedGraph extends KGraphInduced{

    backup: IGraph

    allSet : YNodeList
    labelSet: YNodeList
    groupSet: YNodeList
    individualsSet: YNodeList
    maleSet: YNodeList
    femaleSet: YNodeList
    othersSet: YNodeList

    constructor(graphComponent: GraphComponent, kGraph: KGraph) {
        super(graphComponent,kGraph);

        this.removeComponents();
        this.initializeSets();

        this.backup = this.graphComponent.graph;
    }

    removeComponents(){

        this.numComponents = 1;
        this.set = new YNodeList();

        let oneConnected = new SimpleConnectedComponents(this.graphComponent);
        let nodes2Remove = oneConnected.calculateFrequentVertices(this.numComponents);

        this.graphComponent.graph.nodes.forEach(currentNode =>{
            if ( !nodes2Remove.includes(currentNode)){
                this.set.addFirst(currentNode);
            }
        });

        this.filterSetMembership();
    }


    initializeSets(){

        this.allSet = new YNodeList();
        this.labelSet = new YNodeList();
        this.groupSet = new YNodeList();
        this.individualsSet = new YNodeList();
        this.maleSet = new YNodeList();
        this.femaleSet = new YNodeList();
        this.othersSet = new YNodeList();

        this.graphComponent.graph.nodes.forEach(currentNode =>{
            let currentType = this.originalGraph.vertexType.get(currentNode);
            let currentString = String(currentType);

            this.allSet.addFirst(currentNode);

            switch(currentString){
                case "label":
                    this.labelSet.addFirst(currentNode);
                    break;
                case "group":
                    this.groupSet.addFirst(currentNode);
                    break;
                case "person":
                    this.individualsSet.addFirst(currentNode);
                    break;
                case "male":
                    this.maleSet.addFirst(currentNode);
                    this.individualsSet.addFirst(currentNode);
                    break;
                case "female":
                    this.femaleSet.addFirst(currentNode);
                    this.individualsSet.addFirst(currentNode);
                    break;
                default:
                    this.othersSet.addFirst(currentNode);
                    break;
            }
        })
    }

    remap( newSet : YNodeList){
        let temp = new FilteredGraphWrapper(this.backup,
            (node) => this.vertexPredicate(node,newSet) ,
            (edge) => this.edgePredicate(edge,newSet));

        this.graphComponent.graph = temp;
    }


}