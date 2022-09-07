import {
    FilteredGraphWrapper,
    GraphComponent,
    IEdge,
    IGraph,
    INode, INodeMap,
    YNodeList

} from 'yfiles'

import {SimpleConnectedComponents} from "../algorithm/SimpleConnectedComponents";
import {KGraph} from "./KGraph";

export class KGraphInduced {

    graphComponent : GraphComponent;

    originalGraph: KGraph;
    filteredGraph: IGraph;

    set: YNodeList;
    numComponents: number;


    constructor(graphComponent: GraphComponent, kGraph: KGraph) {

        this.graphComponent = graphComponent;
        this.graphComponent.graph = kGraph.graph;
        this.originalGraph = kGraph;
    }

    vertexPredicate( node: INode,set: YNodeList){
        if( set.includes(node)){
            return true;
        }
        else{
            return false;
        }
    }

    edgePredicate( edge: IEdge,set: YNodeList){

        if( set.includes(edge.sourceNode) &&
            set.includes(edge.targetNode)){
            return true;
        }
        else{
            return false;
        }
    }

    filterSetMembership(){
        this.filteredGraph = new FilteredGraphWrapper(this.graphComponent.graph,
            (node) => this.vertexPredicate(node,this.set) ,
            (edge) => this.edgePredicate(edge,this.set));

        this.graphComponent.graph = this.filteredGraph;
    }

    filterSet( list : YNodeList){
        this.filteredGraph = new FilteredGraphWrapper(this.graphComponent.graph,
            (node) => this.vertexPredicate(node,list) ,
            (edge) => this.edgePredicate(edge,list));

        this.graphComponent.graph = this.filteredGraph;
    }

    filterComponents(){

        let oneConnected = new SimpleConnectedComponents(this.graphComponent);
        let nodes2Remove = oneConnected.calculateFrequentVertices(this.numComponents);

        this.set.removeAll(nodes2Remove);

        this.filteredGraph = new FilteredGraphWrapper(this.graphComponent.graph,
            (node) => this.vertexPredicate(node,this.set) ,
            (edge) => this.edgePredicate(edge,this.set));

        this.graphComponent.graph = this.filteredGraph;
    }


    applyFilter(){
        this.filterSetMembership();
        this.filterComponents();
        this.graphComponent.graph = this.filteredGraph;
    }




}