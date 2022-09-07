import {
    Fill,
    ShapeNodeStyle, Stroke
} from "yfiles";

const vertexStrokeSize = 2;
const vertexStrokeFill = Fill.BLACK;
const vertexStroke = new Stroke(vertexStrokeFill,vertexStrokeSize);

export const labelNodeStyle: ShapeNodeStyle = new ShapeNodeStyle({
    shape: 'rectangle',
    fill: 'orange',
    stroke: vertexStroke
});

export const groupNodeStyle: ShapeNodeStyle = new ShapeNodeStyle({
    shape: 'rectangle',
    fill: 'red',
    stroke: vertexStroke
});

export const personNodeStyle: ShapeNodeStyle = new ShapeNodeStyle({
    shape: 'rectangle',
    fill: 'lightgreen',
    stroke: vertexStroke
});

export const maleNodeStyle: ShapeNodeStyle = new ShapeNodeStyle({
    shape: 'rectangle',
    fill: 'lightblue',
    stroke: vertexStroke
});

export const femaleNodeStyle: ShapeNodeStyle = new ShapeNodeStyle({
    shape: 'rectangle',
    fill: 'pink',
    stroke: vertexStroke
});