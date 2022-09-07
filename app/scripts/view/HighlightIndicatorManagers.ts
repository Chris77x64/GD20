import {
    HighlightIndicatorManager, IModelItem, Color, NodeStyleDecorationInstaller, ShapeNodeStyle, CanvasComponent, Stroke, StyleDecorationZoomPolicy, ICanvasObjectInstaller, ShapeNodeShape, EdgeStyleDecorationInstaller, ArrowType, Arrow, PolylineEdgeStyle, GraphComponent
} from 'yfiles'

class SearchHighlightIndicatorManager extends HighlightIndicatorManager<IModelItem> {
    decorationInstaller: NodeStyleDecorationInstaller
    constructor(canvasComponent: CanvasComponent) {
      super(canvasComponent)
      const highlightColor = Color.GREEN;
      const highlightStroke = new Stroke(highlightColor.r, highlightColor.g, highlightColor.b, 220, 3)
      highlightStroke.freeze()
      this.decorationInstaller = new NodeStyleDecorationInstaller({
        nodeStyle: new ShapeNodeStyle({
          //shape: ShapeNodeShape.ROUND_RECTANGLE,
          stroke: highlightStroke,
          fill: null
        }),
        margins: 5,
        zoomPolicy: StyleDecorationZoomPolicy.MIXED
      })
    }
  
    /**
     * Callback used by install to retrieve the installer for a given item.
     * @param item The item to find an installer for.
     * @returns {ICanvasObjectInstaller}
     */
    getInstaller(item): ICanvasObjectInstaller {
      return this.decorationInstaller
    }
}
  
class FoundHighlightIndicatorManager extends HighlightIndicatorManager<any> {
    decorationInstaller: NodeStyleDecorationInstaller
    constructor(canvasComponent: CanvasComponent) {
      super(canvasComponent)
      const highlightColor = Color.TOMATO;
      const highlightStroke = new Stroke(highlightColor.r, highlightColor.g, highlightColor.b, 220, 3)
      highlightStroke.freeze()
      this.decorationInstaller = new NodeStyleDecorationInstaller({
        nodeStyle: new ShapeNodeStyle({
          //shape: ShapeNodeShape.ROUND_RECTANGLE,
          stroke: highlightStroke,
          fill: null
        }),
        margins: 5,
        zoomPolicy: StyleDecorationZoomPolicy.MIXED
      })
    }
  
    /**
     * Callback used by install to retrieve the installer for a given item.
     * @param item The item to find an installer for.
     * @returns {ICanvasObjectInstaller}
     */
    getInstaller(item): ICanvasObjectInstaller {
      return this.decorationInstaller
    }
}

class HoverNodeStyleDecorationInstaller extends NodeStyleDecorationInstaller {
    decorationInstaller: NodeStyleDecorationInstaller
    constructor(){
        const orangeRed = Color.ORANGE_RED
        const orangeStroke = new Stroke(orangeRed.r, orangeRed.g, orangeRed.b, 220, 3)
        orangeStroke.freeze()
    
        const highlightShape = new ShapeNodeStyle({
        shape: ShapeNodeShape.ROUND_RECTANGLE,
        stroke: orangeStroke,
        fill: null
        })
        
        super({
            nodeStyle: highlightShape,
            // that should be slightly larger than the real node
            margins: 5,
            // but have a fixed size in the view coordinates
            zoomPolicy: StyleDecorationZoomPolicy.VIEW_COORDINATES
        })
    }

    /**
     * Callback used by install to retrieve the installer for a given item.
     * @param item The item to find an installer for.
     * @returns {ICanvasObjectInstaller}
     */
    getInstaller(item): ICanvasObjectInstaller {
        return this.decorationInstaller
      }
}

class HoverEdgeStyleDecorationInstaller extends EdgeStyleDecorationInstaller {
    decorationInstaller: NodeStyleDecorationInstaller
    constructor(){
        const orangeRed = Color.ORANGE_RED
        const orangeStroke = new Stroke(orangeRed.r, orangeRed.g, orangeRed.b, 220, 3)
        orangeStroke.freeze()

        const dummyCroppingArrow = new Arrow({
        type: ArrowType.CIRCLE,
        cropLength: 5
        })
        const edgeStyle = new PolylineEdgeStyle({
        stroke: orangeStroke,
        targetArrow: dummyCroppingArrow,
        sourceArrow: dummyCroppingArrow
        })
        super({
            edgeStyle,
            zoomPolicy: StyleDecorationZoomPolicy.VIEW_COORDINATES
        })
    }
    
    /**
     * Callback used by install to retrieve the installer for a given item.
     * @param item The item to find an installer for.
     * @returns {ICanvasObjectInstaller}
     */
    getInstaller(item): ICanvasObjectInstaller {
        return this.decorationInstaller
      }
}

export class HighlightIndicatorManagers {
    searchHIM : SearchHighlightIndicatorManager
    foundHIM : FoundHighlightIndicatorManager
    hoverNodeHIM : HoverNodeStyleDecorationInstaller
    hoverEdgeHIM : HoverEdgeStyleDecorationInstaller
    graphComponent: GraphComponent
    hoverStylesReady : boolean
    constructor(graphComponent: GraphComponent) {
        this.searchHIM = new SearchHighlightIndicatorManager(graphComponent)
        this.foundHIM = new FoundHighlightIndicatorManager(graphComponent)
        this.hoverNodeHIM = new HoverNodeStyleDecorationInstaller();
        this.hoverEdgeHIM = new HoverEdgeStyleDecorationInstaller();
        this.graphComponent = graphComponent;
        this.hoverStylesReady = false;
        this.initDefaultHoverStyles();
    }

    getSearchHIM(){
        return this.searchHIM;
    }
    getFoundHIM() {
        return this.foundHIM;
    }

    getHoverHIM() {
        if(!this.hoverStylesReady){
            this.initDefaultHoverStyles();
            this.hoverStylesReady = true;
        }
        return this.graphComponent.highlightIndicatorManager;
    }

    initDefaultHoverStyles(){
        this.graphComponent.graph.decorator.nodeDecorator.highlightDecorator.setImplementation(this.hoverNodeHIM);
        this.graphComponent.graph.decorator.edgeDecorator.highlightDecorator.setImplementation(this.hoverEdgeHIM);
    }
}