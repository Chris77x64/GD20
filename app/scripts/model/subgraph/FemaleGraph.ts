import {
    GraphComponent
} from 'yfiles'

import {SimplyConnectedGraph} from "./SimplyConnectedGraph";
import {KGraph} from "../KGraph";

export class FemaleGraph extends SimplyConnectedGraph{

    constructor(graphComponent: GraphComponent, kGraph: KGraph,numComponents) {
        super(graphComponent,kGraph);

        this.set = this.femaleSet;
        this.numComponents = numComponents;

        this.applyFilter();
    }

}