import {
    CircularLayout,
    GraphComponent,
    HierarchicLayout,
    ILayoutAlgorithm,
    LayoutExecutor,
    OrthogonalLayout,
    RadialLayout
} from 'yfiles'

import {
    allLayoutOrganic,
    femaleLayoutOrganic,
    groupsLayoutOrganic,
    individualsLayoutOrganic,
    labelsLayoutOrganic,
    layoutTarget,
    layoutType,
    maleLayoutOrganic,
    othersLayoutOrganic
} from "./GraphLayout";

export class GraphLayoutManager{

    graphComponent: GraphComponent

    layout: ILayoutAlgorithm
    layoutExecutor: LayoutExecutor

    currentLayout: layoutType
    currentTarget: layoutTarget

    constructor(graphComponent: GraphComponent) {
        this.graphComponent = graphComponent;
        this.currentLayout = layoutType.Organic;
    }

    applyLayout( type: layoutType, target : layoutTarget){

        console.log('Layout Type: ',type,'Layout Target', target);

        switch(type){
            case layoutType.Circular:
                this.layout = new CircularLayout();
                break;
            case layoutType.Hierarchic:
                this.layout = new HierarchicLayout();
                break;
            case layoutType.Orthogonal:
                this.layout = new OrthogonalLayout();
                break;
            case layoutType.Radial:
                this.layout = new RadialLayout();
                break;
            case layoutType.Organic:
                switch(target){
                    case layoutTarget.allLayout:
                        this.layout = allLayoutOrganic;
                        break;
                    case layoutTarget.labelsLayout:
                        this.layout = labelsLayoutOrganic;
                        break;
                    case layoutTarget.groupsLayout:
                        this.layout = groupsLayoutOrganic;
                        break;
                    case layoutTarget.individualsLayout:
                        this.layout = individualsLayoutOrganic;
                        break;
                    case layoutTarget.maleLayout:
                        this.layout = maleLayoutOrganic;
                        break;
                    case layoutTarget.femaleLayout:
                        this.layout = femaleLayoutOrganic;
                        break;
                    case layoutTarget.othersLayout:
                        this.layout = othersLayoutOrganic;
                        break;
                }
                break;
        }

        this.layoutExecutor = new LayoutExecutor(this.graphComponent,this.layout);
        this.layoutExecutor.start();
        this.graphComponent.fitContent();

    }

    zoomToContentRect(){
        const contentRect = this.graphComponent.contentRect;
        this.graphComponent.zoomTo(contentRect);
    }

}