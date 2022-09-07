import {
    EdgeList,
    GraphComponent,
    GraphConnectivity, IGraph, INode,
    YGraphAdapter,
    YNodeList
} from 'yfiles'

export class BlockCutTree {

    graphComponent: GraphComponent

    BNodes: YNodeList[]
    BEdges: EdgeList[]
    CNodes: YNodeList

    bcTree: IGraph

    bipartitionBlock:  INode[]
    bipartitionCutvertex:  INode[]

    constructor(graphComponent: GraphComponent) {

        this.graphComponent = graphComponent;

        this.initializeDefaults(graphComponent);
        this.calculateBiconnectedComponents();
        this.calculateBCTree();


    }

    initializeDefaults(graphComponent: GraphComponent){

        this.graphComponent = graphComponent;


        // Vertices and Edges of the Actual Graph
        this.BNodes = [];
        this.BEdges = [ ];
        this.CNodes = new YNodeList();

        // Vertices of constructed BC-Tree with tempB and tempC being its bipartition
        this.bcTree = this.graphComponent.createGraph();

        this.bipartitionBlock = [ ];
        this.bipartitionCutvertex = [ ];

    }

    calculateBiconnectedComponents(){
        const graphAdapter = new YGraphAdapter(this.graphComponent.graph);
        const adapterGraph = graphAdapter.yGraph;

        const articulationPoints = adapterGraph.createNodeMap();
        const biconnectedComponents = adapterGraph.createEdgeMap();

        let numComps = GraphConnectivity.biconnectedComponents(adapterGraph,biconnectedComponents,articulationPoints);

        this.initializeCutvertices(graphAdapter,articulationPoints);
        this.initializeBlocks(graphAdapter,biconnectedComponents,numComps);
    }

    initializeCutvertices(graphAdapter,articulationPoints){

        graphAdapter.yGraph.nodes.forEach(currentNode => {

            let isArticulationPoint = articulationPoints.get(currentNode);

            if(  isArticulationPoint ){
                const originalNode = graphAdapter.getOriginalNode(currentNode);
                this.CNodes.addFirst(originalNode);
            }
        });
    }

    initializeBlocks( graphAdapter, biconnectedComponents, numComps){

        let biconnectedEdges = GraphConnectivity.toEdgeListArray(graphAdapter.yGraph,biconnectedComponents,numComps);

        for( let i=0; i < numComps; i++){
            let currentEdges = biconnectedEdges[i];
            this.BNodes[i] = this.translateVertices(currentEdges,graphAdapter);
            this.BEdges[i] = this.translateEdges(currentEdges,graphAdapter);
        }

    }

    translateEdges(edgeList,graphAdapter){

        let result = new EdgeList();
        edgeList.forEach(currentEdge =>{
            let originalEdge = graphAdapter.getOriginalEdge(currentEdge);
            result.addFirst(originalEdge);
        });
        return result;
    }

    translateVertices(edgeList,graphAdapter){

        let result = new YNodeList();

        edgeList.forEach(currentEdge =>{

            let sourceVertex = currentEdge.source;
            let targetVertex = currentEdge.target;

            sourceVertex = graphAdapter.getOriginalNode(sourceVertex);
            targetVertex = graphAdapter.getOriginalNode(targetVertex);

            if( !result.includes(sourceVertex)){
                result.addFirst(sourceVertex);
            }
            if( !result.includes(targetVertex)){
                result.addFirst(targetVertex);
            }
        });

        return result;
    }


    calculateBCTree(){

        for( let i=0 ; i < this.BNodes.length; i++){
            this.bipartitionBlock[i] = this.bcTree.createNode();
        }

        for( let k=0; k < this.CNodes.size; k++){

            let newCutVertex = this.bcTree.createNode();
            this.bipartitionCutvertex[k] = newCutVertex;

            for( let i=0 ; i < this.BNodes.length; i++){

                let currentBlock = this.BNodes[i];
                let currentCutVertex = this.CNodes.get(k);

                let newBlockVertex = this.bipartitionBlock[i];

                if ( currentBlock.includes(currentCutVertex) ){
                    this.bcTree.createEdge(newCutVertex,newBlockVertex)
                }
            }
        }
    }


}