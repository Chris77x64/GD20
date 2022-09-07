import {
    GraphComponent
} from 'yfiles'

import {SimplyConnectedGraph} from "./SimplyConnectedGraph";
import {KGraph} from "../KGraph";

export class GroupGraph extends SimplyConnectedGraph{

    constructor(graphComponent: GraphComponent, kGraph: KGraph,numComponents) {
        super(graphComponent,kGraph);

        this.set = this.groupSet;
        this.numComponents = numComponents;

        this.applyFilter();
    }

}