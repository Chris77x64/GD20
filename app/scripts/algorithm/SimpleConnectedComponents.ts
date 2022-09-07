import {
    GraphComponent,
    GraphConnectivity,
    INodeMap,
    YGraphAdapter,
    YNodeList
} from 'yfiles'

export class SimpleConnectedComponents {

    graphComponent: GraphComponent;

    graphAdapter: YGraphAdapter;
    components: INodeMap;

    componentOrder: [ ];

    constructor( graphComponent: GraphComponent) {
        this.graphComponent = graphComponent;

        this.initializeComponents();
        this.calculateFrequentVertices(3);
    }

    initializeComponents(){
        this.graphAdapter = new YGraphAdapter(this.graphComponent.graph);
        this.components = this.graphAdapter.yGraph.createNodeMap();
        GraphConnectivity.connectedComponents(this.graphAdapter.yGraph,this.components);
    }

    calculateFrequency( ){

        let frequency = {};

        this.graphAdapter.yGraph.nodes.forEach(currentNode =>{
            let value = this.components.get(currentNode);
            let count = frequency[value];
            if( count === undefined){
                frequency[value]= 1;
            }
            else{
                frequency[value] = count +1;
            }
        });

        return frequency;
    }

    orderByFrequency( ){

        let frequency = this.calculateFrequency();

        let items = Object.keys(frequency).map(function(key) {
            return [key, frequency[key]];
        });

        items.sort(function(first, second) {
            return second[1] - first[1];
        })

        return items;

    }

    calculateFrequentVertices( numComponents: number){

        let items = this.orderByFrequency();

        let commonComponents = items.slice(0, numComponents);
        let commonIndices = [];

        commonComponents.forEach(entry =>{
            let currentIndex = entry[0];
            commonIndices.push(currentIndex);
        })

        let result = new YNodeList();


        this.graphAdapter.yGraph.nodes.forEach( currentNode =>{

            let currentIndex = this.components.get(currentNode);
            let currentString = String(currentIndex);

            if( ! commonIndices.includes(currentString)){
                let translatedNode = this.graphAdapter.getOriginalNode(currentNode);
                result.addFirst(translatedNode);
            }

        });

        return result;

    }

}
