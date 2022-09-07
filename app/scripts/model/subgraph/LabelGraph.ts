import {
    GraphComponent
} from 'yfiles'

import {SimplyConnectedGraph} from "./SimplyConnectedGraph";
import {KGraph} from "../KGraph";

export class LabelGraph extends SimplyConnectedGraph{

    constructor(graphComponent: GraphComponent, kGraph: KGraph,numComponents) {
        super(graphComponent,kGraph);

        this.set = this.labelSet;
        this.numComponents = numComponents;

        this.applyFilter();
        console.log('NUM LABELS',this.set.size);
    }

}