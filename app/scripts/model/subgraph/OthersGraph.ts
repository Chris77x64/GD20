import {
    GraphComponent,
    YNodeList
} from 'yfiles'

import {KGraphInduced} from "../KGraphInduced";
import {SimpleConnectedComponents} from "../../algorithm/SimpleConnectedComponents";
import {KGraph} from "../KGraph";

export class OthersGraph extends KGraphInduced{

    constructor(graphComponent: GraphComponent, kGraph: KGraph,numComponents) {
        super(graphComponent,kGraph);

        this.calculateOthers(numComponents);
    }

    calculateOthers(numComponents){

        this.numComponents = numComponents;
        this.set = new YNodeList();

        let oneConnected = new SimpleConnectedComponents(this.graphComponent);
        let nodes2Remove = oneConnected.calculateFrequentVertices(1);

        this.graphComponent.graph.nodes.forEach(currentNode =>{
            if ( nodes2Remove.includes(currentNode)){
                this.set.addFirst(currentNode);
            }
        });

        this.applyFilter();
    }

}