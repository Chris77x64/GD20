import {
    IEdge,
    IGraph,
    IIntersectionHandler,
    IntersectionAlgorithm,
    LineSegment,
    YList
} from 'yfiles'


export class SweepLine {

    lineSegments: YList
    intersections: number

    constructor() {

        this.lineSegments = new YList();
    }

    initializeSegments(currentDrawing: IGraph){
        this.lineSegments.clear();

        currentDrawing.edges.forEach(currentEdge =>{
            let currentSegment: LineSegment = this.segment(currentEdge);
            this.lineSegments.addFirst(currentSegment);
        });

    }

    segment( input: IEdge): LineSegment{
        let sourcePoint = input.sourcePort.location.toYPoint();
        let targetPoint = input.targetPort.location.toYPoint();
        return new LineSegment(sourcePoint,targetPoint);
    }

    calculateIntersection(a: any,b:any){
        let segment1 = <LineSegment> a;
        let segment2 = <LineSegment> b;
        let intersection = LineSegment.getIntersection(segment1,segment2);
        if( intersection != null){
            this.intersections = this.intersections+1;
        }
    }

    calculateCrossings( currentDrawing: IGraph): number{
        this.sweep(currentDrawing);
        return this.intersections;
    }

    sweep(currentDrawing: IGraph) {

        this.intersections = 0;
        this.initializeSegments(currentDrawing);

        // @ts-ignore
        const handler = new IIntersectionHandler( (a,b) => this.calculateIntersection(a,b));
        IntersectionAlgorithm.intersect(this.lineSegments,handler);
    }

}