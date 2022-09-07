import {
    Graph,
    GraphComponent,
    GraphEditorInputMode,
    GraphOverviewComponent,
    MutableRectangle,
    OverviewInputMode, PlanarEmbedding,
    SvgVisual,
    YRectangle
} from 'yfiles'

import {SimplyConnectedGraph} from "./SimplyConnectedGraph";
import {KGraph} from "../KGraph";
import LimitedRectangleDescriptor from "./LimitedRectangleDescriptor";

export class LabelRegionGraph extends SimplyConnectedGraph{


    defaultWidth: number;
    defaultHeight: number;

    grid: any[][];
    gridWidth: number;
    gridHeight: number;

    constructor(graphComponent: GraphComponent, kGraph: KGraph) {
        super(graphComponent,kGraph);

        this.set = this.labelSet;

        this.filterSetMembership();
        this.graphComponent.graph = this.filteredGraph;
        console.log('NUM LABELS',this.set.size);
        this.initializeDefaults();
        this.drawGrid();
        this.printDegreeSort(kGraph);
       // console.log(PlanarEmbedding.isPlanar(this.graphComponent.graph))
       // let embedding = new PlanarEmbedding(new Graph(this.graphComponent.graph))
    }

    initializeDefaults(){
        this.defaultWidth = 200;
        this.defaultHeight = 200;
        this.gridWidth = 14;
        this.gridHeight = 14;
        this.grid = new Array(this.gridHeight);
    }


    drawGrid(){

        for( let row=0; row < this.gridHeight; row++){
            this.grid[row] = new Array(this.gridHeight);
            for( let col=0; col < this.gridWidth; col++){
                let currentRect = new YRectangle(col*this.defaultWidth,(row+1)*this.defaultHeight,this.defaultWidth,this.defaultHeight);
                this.grid[row][col] = currentRect;
                //this.graphComponent.highlightGroup.addChild(currentRect,new LimitedRectangleDescriptor());
            }
        }
    }

    createInputMode(){
        let editorMode = new GraphEditorInputMode();
        let edgeInputMode = editorMode.createEdgeInputMode;
        edgeInputMode.allowCreateBend = false;
        editorMode.allowCreateNode = false;
        editorMode.allowCreateEdge = false;
       return editorMode;
    }

    printDegreeSort(kGraph: KGraph){

        let nodes = this.graphComponent.graph.nodes;
        let degreeSorted = nodes.orderBy( (currentNode) =>currentNode,(first,second) =>{
            let firstDegree = kGraph.vertexDegree.get(first);
            let secondDegree = kGraph.vertexDegree.get(second);
            if ( firstDegree > secondDegree)
            return firstDegree > secondDegree ? 1 : -1;
        });

        degreeSorted.forEach(currentNode =>{
           let currentDegree =  kGraph.vertexDegree.get(currentNode);
           let currentName = kGraph.vertexName.get(currentNode);
           console.log(currentName,' || ',currentDegree);
        });
    }
}