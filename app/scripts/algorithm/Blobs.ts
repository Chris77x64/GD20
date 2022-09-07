import {
    BaseClass,
    Color,
    IVisualCreator,
} from 'yfiles'
import WebglBlobVisual from './WebglBlobVisual';

export default class BlobBackground extends BaseClass(IVisualCreator) {

    selector: any
    size: number
    color: Color

    constructor(selector, color, size) {
        super()
        this.selector = selector
        this.size = size
        this.color = color
    }

    createVisual(renderContext) {

        return new WebglBlobVisual(
            renderContext.canvasComponent.graph.nodes
                .filter(this.selector)
                .map(n => n.layout.center.toPoint()),
            this.color,
            this.size,500);
    }

    updateVisual(renderContext, oldVisual) {
        return oldVisual
    }
}