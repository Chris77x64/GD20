import {
    DefaultLabelStyle,
    GraphComponent, ILabel,
} from 'yfiles'
import {KGraph} from "../model/KGraph";

export class GraphLabel{

    graphComponent: GraphComponent
    kGraph: KGraph

    enableLabels: boolean
    labels: ILabel[]

    styleLabel : DefaultLabelStyle;

    constructor(graphComponent: GraphComponent, kGraph: KGraph) {
        this.graphComponent = graphComponent;
        this.kGraph = kGraph;
        this.initializeLabels();
        this.labels = [];
    }

    initializeLabels(){
        this.enableLabels = false;
        this.styleLabel = new DefaultLabelStyle();
    }

    reset(){
        this.labels.forEach(currentLabel => {
            if (this.graphComponent.graph.contains(currentLabel))
                this.graphComponent.graph.remove(currentLabel);
        })
        this.labels = [ ];
    }

    update(){

            if( this.enableLabels) {
                this.labels = [];

                this.graphComponent.graph.nodes.forEach(currentNode => {
                    let currentName = this.kGraph.vertexName.get(currentNode);
                    currentName = String(currentName);

                    let currentLabel = this.graphComponent.graph.addLabel(currentNode, currentName);

                    this.graphComponent.graph.setStyle(currentLabel, this.styleLabel);

                    this.labels.push(currentLabel);
                })
            }
    }


    toggle(){

        if( this.enableLabels){
            this.enableLabels = false;
            this.reset();
        }
        else{
            this.enableLabels = true;
            this.update();
        }
    }



}