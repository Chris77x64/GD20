import {
    GraphComponent, INode, Point, Rect, Size
} from 'yfiles'
import {KGraph} from "../model/KGraph";

import {labelNodeStyle, groupNodeStyle, maleNodeStyle, femaleNodeStyle, personNodeStyle} from "./NodeStyle";

export class GraphStyle{

    graphComponent: GraphComponent;

    minNodeSize:number;
    maxNodeSize:number;
    areaProportional: boolean;

    constructor(graphComponent: GraphComponent) {

        this.graphComponent = graphComponent;
        this.minNodeSize = 20;
        this.maxNodeSize = 150;
        this.areaProportional = true;

    }

    update(graphK: KGraph){
        this.updateVertexStyle(graphK);
    }

    updateVertexSize(currentNode: INode,degree: number){

        if(this.areaProportional){

            let sizeVertex = this.minNodeSize + (degree / (180 - 1)) * this.maxNodeSize;

            let xValue = currentNode.layout.x;
            let yValue = currentNode.layout.y;

            let point = new Point(xValue, yValue);
            let size = new Size(sizeVertex,sizeVertex);
            let rect = new Rect(point,size);

            this.graphComponent.graph.setNodeLayout(currentNode,rect);
        }
    }

    updateVertexStyle(graphK: KGraph){
        this.graphComponent.graph.nodes.forEach(currentNode =>{

            let type = graphK.vertexType.get(currentNode);
            let degree = graphK.vertexDegree.get(currentNode);
            let typeString = String(type);


            let nodeStyle = null;

            switch (typeString) {
                case 'group':
                    nodeStyle = groupNodeStyle;
                    break;
                case 'male':
                    nodeStyle = maleNodeStyle;
                    break;
                case 'female':
                    nodeStyle = femaleNodeStyle;
                    break;
                case 'person':
                    nodeStyle = personNodeStyle;
                    break;
                case 'label':
                    nodeStyle = labelNodeStyle;
                    break;
                default:
                    console.log("Some error with setting the right color at type " + typeString);

            }

            this.graphComponent.graph.setStyle(currentNode,nodeStyle);

            this.updateVertexSize(currentNode,degree);


        });
    }

}