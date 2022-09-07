import {
    Maps,
    INodeMap,
    DefaultGraph, GraphComponent
} from 'yfiles'

import {KNode} from "./KNode";
import {KEdge} from "./KEdge";
import {GraphIO} from "../controller/GraphIO";

export class KGraph {

    vertexList: KNode[];
    edgeList: KEdge[];

    vertexID: { };
    vertexMAP: INodeMap;
    vertexType: INodeMap;
    vertexName:INodeMap;
    vertexDegree: INodeMap;

    graph: DefaultGraph;

    constructor(graphIO: GraphIO) {

        this.graph = new DefaultGraph();

        this.vertexList = graphIO.vertexList;
        this.edgeList = graphIO.edgeList;

        this.initializeNodeMaps();
        this.createVertices();
        this.createEdges();
        this.initializeDegreeMap();

    }


    initializeNodeMaps(){
        this.vertexID = { };
        this.vertexMAP = Maps.createHashedNodeMap();
        this.vertexType = Maps.createHashedNodeMap();
        this.vertexName = Maps.createHashedNodeMap();
        this.vertexDegree = Maps.createHashedNodeMap();
    }

    createVertices(){

        for( let i=0; i < this.vertexList.length; i++){

            let currentID = this.vertexList[i].id;
            let currentType = this.vertexList[i].type;
            let currentName = this.vertexList[i].name;

            const currentVertex = this.graph.createNode();

            this.vertexID[currentID] = currentVertex;
            this.vertexMAP.set(currentVertex,currentID);
            this.vertexType.set(currentVertex,currentType);
            this.vertexName.set(currentVertex,currentName);

            currentVertex.tag = currentID;

        }

    }

    createEdges( ){

        for( let i=0; i < this.edgeList.length; i++){

            let sourceID = this.edgeList[i].node1
            let targetID = this.edgeList[i].node2;

            const sourceVertex = this.vertexID[sourceID];
            const targetVertex = this.vertexID[targetID];

            this.graph.createEdge(sourceVertex,targetVertex);
        }

    }

    initializeDegreeMap(){
        this.graph.nodes.forEach(currentVertex =>{
            let degree = this.graph.degree(currentVertex);
            this.vertexDegree.set(currentVertex,degree);
        });
    }




    /*
    importLayoutCSV(csvName){

        for( let i=0; i < this.vertexList.length; i++){

            let currentID = this.vertexList[i].id;
            let currentX = this.vertexList[i].layoutX;
            let currentY = this.vertexList[i].layoutY;

            const currentNode = this.vertexID[currentID];
            const newPosition = new Point(currentX,currentY);

            this.graphComponent.graph.setNodeCenter(currentNode,newPosition);
        }

        this.graphComponent.fitContent();
    }

     */


}
