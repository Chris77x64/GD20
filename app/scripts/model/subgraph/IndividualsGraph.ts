import {
    GraphComponent, YNodeList
} from 'yfiles'

import {SimplyConnectedGraph} from "./SimplyConnectedGraph";
import {KGraph} from "../KGraph";

export class IndividualsGraph extends SimplyConnectedGraph{

    constructor(graphComponent: GraphComponent, kGraph: KGraph, numComponents) {
        super(graphComponent,kGraph);

        this.set = this.individualsSet;

        this.numComponents = numComponents;

        this.applyFilter();
    }

}