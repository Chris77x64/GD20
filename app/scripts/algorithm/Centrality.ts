import {
    GraphComponent,
    INode, INodeMap, Maps,
    YNodeList
} from 'yfiles'

import {BlockCutTree} from "./BlockCutTree";

export class Centrality {

    tree: BlockCutTree
    root : INode

    heightBlock: INodeMap;
    dfsVisited: INodeMap;

    heightMap: INodeMap;
    blockMap: INodeMap;
    maximumHeight: number

    constructor(graphComponent: GraphComponent) {

        this.tree = new BlockCutTree(graphComponent);

        this.calculateCentralVertex();

        this.heightBlock = Maps.createHashedNodeMap();
        this.dfsVisited = Maps.createHashedNodeMap();
        this.heightMap = Maps.createHashedNodeMap();
        this.blockMap = Maps.createHashedNodeMap();
        this.maximumHeight = 0;

        this.calculateHeight();
        this.calculateHeightMap();

        console.log(this.maximumHeight);
        // graphComponent.graph.nodes.forEach(currentNode=>{
        //     graphComponent.graph.addLabel(currentNode,String(this.heightMap.getNumber(currentNode)));
        // })
    }

    calculateHeightMap(){

        let blocks = this.tree.bipartitionBlock;
        for( let i=0 ; i < blocks.length; i++){
            let currentBlock: INode = blocks[i];
            let correspondingOriginalNodes: YNodeList = this.tree.BNodes[i];
            let blockHeight = this.heightBlock.getNumber(currentBlock);

            correspondingOriginalNodes.forEach(originalNode =>{
                if ( this.heightMap.get(originalNode) == undefined){
                    this.blockMap.setNumber(originalNode,i);
                    this.heightMap.setNumber(originalNode,blockHeight);
                }
            });
        }

    }

    calculateHeight(){

        this.heightBlock.set(this.root,1);

        let nodes = this.tree.bcTree.nodes;

        nodes.forEach(currentVertex =>{
            this.dfsVisited.setBoolean(currentVertex,false);
        })

        this.heightWorker(this.root,1);

    }

    heightWorker( currentNode: INode, currentHeight: number){


        let neighbours = this.tree.bcTree.neighbors(currentNode);
        this.dfsVisited.setBoolean(currentNode,true);
        this.heightBlock.setNumber(currentNode,currentHeight);

        if( currentHeight > this.maximumHeight){
            this.maximumHeight = currentHeight;
        }

        if(  !(neighbours.size == 1)){

            let newHeight = currentHeight;

            if( this.tree.bipartitionCutvertex.includes(currentNode)){
                newHeight = newHeight+1;
            }

            neighbours.forEach(currentNeighbour =>{
                let neighbourVisited = this.dfsVisited.getBoolean(currentNeighbour);

                if( ! neighbourVisited){
                        this.heightWorker(currentNeighbour,newHeight);
                }
            });


        }

    }

    calculateCentralVertex(){

        let nodes = this.tree.bipartitionBlock;

        let maxDegree = -1;
        let maxBlock : INode;

        nodes.forEach(currentVertex =>{
            let currentDegree = this.tree.bcTree.degree(currentVertex);
            if ( currentDegree > maxDegree){
                maxDegree = currentDegree;
                maxBlock = currentVertex;
            }
        });

        this.root = maxBlock;

    }
}