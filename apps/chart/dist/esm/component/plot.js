import Component from "./component";
import { crispPixel, makeTickPixelPositions } from "../helpers/calculator";
import { pick } from "../helpers/utils";
function getPlotAxisData(vertical, axes) {
    return vertical ? axes.xAxis : axes.yAxis;
}
export default class Plot extends Component {
    constructor() {
        super(...arguments);
        this.models = { plot: [] };
        this.startIndex = 0;
    }
    initialize() {
        this.type = 'plot';
    }
    getPlotAxisSize(vertical) {
        return {
            offsetSize: vertical ? this.rect.width : this.rect.height,
            anchorSize: vertical ? this.rect.height : this.rect.width,
        };
    }
    renderPlotLineModels(relativePositions, vertical, options = {}) {
        var _a, _b, _c;
        const { size, startPosition, axes } = options;
        const { lineColor: color, lineWidth, dashSegments } = this.theme[vertical ? 'vertical' : 'horizontal'];
        const tickInterval = ((_c = (vertical ? (_a = axes) === null || _a === void 0 ? void 0 : _a.xAxis : (_b = axes) === null || _b === void 0 ? void 0 : _b.yAxis)) === null || _c === void 0 ? void 0 : _c.tickInterval) || 1;
        return relativePositions
            .filter((_, idx) => !(idx % tickInterval))
            .map((position) => this.makeLineModel(vertical, position, { color, lineWidth, dashSegments }, (size !== null && size !== void 0 ? size : this.rect.width), (startPosition !== null && startPosition !== void 0 ? startPosition : 0)));
    }
    renderPlotsForCenterYAxis(axes) {
        const { xAxisHalfSize, secondStartX, yAxisHeight } = axes.centerYAxis;
        // vertical
        const xAxisTickCount = axes.xAxis.tickCount;
        const verticalLines = [
            ...this.renderPlotLineModels(makeTickPixelPositions(xAxisHalfSize, xAxisTickCount), true),
            ...this.renderPlotLineModels(makeTickPixelPositions(xAxisHalfSize, xAxisTickCount, secondStartX), true),
        ];
        // horizontal
        const yAxisTickCount = axes.yAxis.tickCount;
        const yAxisTickPixelPositions = makeTickPixelPositions(yAxisHeight, yAxisTickCount);
        const horizontalLines = [
            ...this.renderPlotLineModels(yAxisTickPixelPositions, false, { size: xAxisHalfSize }),
            ...this.renderPlotLineModels(yAxisTickPixelPositions, false, {
                size: xAxisHalfSize,
                startPosition: secondStartX,
            }),
        ];
        return [...verticalLines, ...horizontalLines];
    }
    renderPlots(axes, scale) {
        const vertical = true;
        return axes.centerYAxis
            ? this.renderPlotsForCenterYAxis(axes)
            : [
                ...this.renderPlotLineModels(this.getHorizontalTickPixelPositions(axes), !vertical, {
                    axes,
                }),
                ...this.renderPlotLineModels(this.getVerticalTickPixelPositions(axes, scale), vertical, {
                    axes,
                }),
            ];
    }
    getVerticalTickPixelPositions(axes, scale) {
        var _a, _b, _c, _d, _e, _f, _g;
        const { offsetSize } = this.getPlotAxisSize(true);
        const axisData = getPlotAxisData(true, axes);
        if ((_a = axisData) === null || _a === void 0 ? void 0 : _a.labelRange) {
            const sizeRatio = (_d = (_c = (_b = scale) === null || _b === void 0 ? void 0 : _b.xAxis) === null || _c === void 0 ? void 0 : _c.sizeRatio, (_d !== null && _d !== void 0 ? _d : 1));
            const positionRatio = (_g = (_f = (_e = scale) === null || _e === void 0 ? void 0 : _e.xAxis) === null || _f === void 0 ? void 0 : _f.positionRatio, (_g !== null && _g !== void 0 ? _g : 0));
            const axisSizeAppliedRatio = offsetSize * sizeRatio;
            const additional = offsetSize * positionRatio;
            return makeTickPixelPositions(axisSizeAppliedRatio, axisData.tickCount, additional);
        }
        return makeTickPixelPositions(offsetSize, axisData.tickCount);
    }
    getHorizontalTickPixelPositions(axes) {
        const { offsetSize } = this.getPlotAxisSize(false);
        const axisData = getPlotAxisData(false, axes);
        return makeTickPixelPositions(offsetSize, axisData.tickCount);
    }
    renderPlotBackgroundRect() {
        return Object.assign(Object.assign({ type: 'rect', x: 0, y: 0 }, pick(this.rect, 'width', 'height')), { color: this.theme.backgroundColor });
    }
    render(state) {
        var _a, _b;
        const { layout, axes, plot, zoomRange, theme, scale } = state;
        if (!plot) {
            return;
        }
        this.rect = layout.plot;
        this.startIndex = (_b = (_a = zoomRange) === null || _a === void 0 ? void 0 : _a[0], (_b !== null && _b !== void 0 ? _b : 0));
        this.theme = theme.plot;
        const { visible } = plot;
        if (visible) {
            this.models.plot = [this.renderPlotBackgroundRect(), ...this.renderPlots(axes, scale)];
        }
    }
    makeLineModel(vertical, position, { color, dashSegments = [], lineWidth = 1, }, sizeWidth, xPos = 0) {
        const x = vertical ? crispPixel(position) : crispPixel(xPos);
        const y = vertical ? crispPixel(0) : crispPixel(position);
        const width = vertical ? 0 : (sizeWidth !== null && sizeWidth !== void 0 ? sizeWidth : this.rect.width);
        const height = vertical ? this.rect.height : 0;
        return {
            type: 'line',
            x,
            y,
            x2: x + width,
            y2: y + height,
            strokeStyle: color,
            lineWidth,
            dashSegments,
        };
    }
    makeBandModel(vertical, start, end, anchorSize, color) {
        const x = vertical ? crispPixel(start) : crispPixel(0);
        const y = vertical ? crispPixel(0) : crispPixel(start);
        const width = vertical ? end - start : anchorSize;
        const height = vertical ? anchorSize : end - start;
        return { type: 'rect', x, y, width, height, color };
    }
    beforeDraw(painter) {
        painter.ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
        painter.ctx.lineWidth = 1;
    }
}
