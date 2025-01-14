import { extend } from "./store";
import { isUndefined, pick, isNumber } from "../helpers/utils";
import { isCenterYAxis } from "./axes";
import { BUTTON_RECT_SIZE } from "../component/exportMenu";
import { TICK_SIZE } from "../brushes/axis";
import { SPECTRUM_LEGEND_LABEL_HEIGHT, spectrumLegendBar, spectrumLegendTooltip, } from "../brushes/spectrumLegend";
import { getYAxisOption, isLabelAxisOnYAxis } from "../helpers/axes";
const chartPadding = { X: 10, Y: 10 };
export const padding = { X: 10, Y: 15 };
const X_AXIS_HEIGHT = 20;
export function isVerticalAlign(align) {
    return align === 'top' || align === 'bottom';
}
function getValidRectSize(size, width, height) {
    var _a, _b, _c, _d;
    return {
        height: (_b = (_a = size) === null || _a === void 0 ? void 0 : _a.height, (_b !== null && _b !== void 0 ? _b : height)),
        width: (_d = (_c = size) === null || _c === void 0 ? void 0 : _c.width, (_d !== null && _d !== void 0 ? _d : width)),
    };
}
function getDefaultXAxisHeight(size) {
    var _a;
    return ((_a = size.xAxis) === null || _a === void 0 ? void 0 : _a.height) && !size.yAxis ? size.xAxis.height : 0;
}
function getDefaultYAxisXPoint(yAxisRectParam) {
    const { yAxisTitle, isRightSide, visibleSecondaryYAxis } = yAxisRectParam;
    const yAxisWidth = getDefaultYAxisWidth(yAxisRectParam);
    return isRightSide && visibleSecondaryYAxis
        ? Math.max(yAxisTitle.x + yAxisTitle.width - yAxisWidth, 0)
        : yAxisTitle.x;
}
function getYAxisXPoint(yAxisRectParam) {
    const { chartSize, legend, circleLegend, hasCenterYAxis, maxLabelWidth } = yAxisRectParam;
    const { width } = chartSize;
    const { align } = legend;
    let yAxisWidth = getDefaultYAxisWidth(yAxisRectParam);
    let x = getDefaultYAxisXPoint(yAxisRectParam);
    if (hasCenterYAxis) {
        yAxisWidth = maxLabelWidth + (TICK_SIZE + padding.X) * 2;
        x = (width - legend.width - yAxisWidth + padding.X * 2) / 2;
    }
    if (legend.visible && align === 'left') {
        x = getDefaultYAxisXPoint(yAxisRectParam);
    }
    if (circleLegend.visible && align === 'left') {
        x = Math.max(circleLegend.width + padding.X, x);
    }
    return x;
}
function getYAxisYPoint({ yAxisTitle, firstLabelHeight = 0, labelOnYAxis }) {
    const extraLabelHeight = labelOnYAxis ? 0 : firstLabelHeight / 2;
    return yAxisTitle.y + yAxisTitle.height + extraLabelHeight;
}
function getDefaultYAxisWidth({ maxLabelWidth, size, isRightSide }) {
    var _a, _b, _c;
    return _c = (_b = (_a = size) === null || _a === void 0 ? void 0 : _a[isRightSide ? 'secondaryYAxis' : 'yAxis']) === null || _b === void 0 ? void 0 : _b.width, (_c !== null && _c !== void 0 ? _c : maxLabelWidth);
}
function getYAxisWidth(yAxisRectParam) {
    const { hasCenterYAxis, hasXYAxis, maxLabelWidth, visibleSecondaryYAxis = false, isRightSide = false, } = yAxisRectParam;
    let yAxisWidth = getDefaultYAxisWidth(yAxisRectParam);
    if (hasCenterYAxis && !isRightSide) {
        yAxisWidth = maxLabelWidth + (TICK_SIZE + padding.X) * 2;
    }
    else if (!hasXYAxis || (isRightSide && !visibleSecondaryYAxis)) {
        yAxisWidth = 0;
    }
    return yAxisWidth;
}
function getYAxisHeight({ chartSize, legend, yAxisTitle, hasXYAxis, size, xAxisTitleHeight, xAxisData, }) {
    var _a, _b, _c, _d;
    const { height } = chartSize;
    const { align, height: legendHeight } = legend;
    const xAxisHeight = getDefaultXAxisHeight(size) | getXAxisHeight(xAxisData, hasXYAxis);
    const y = yAxisTitle.y + yAxisTitle.height;
    let yAxisHeight = height - y - xAxisHeight - xAxisTitleHeight;
    if (!hasXYAxis) {
        yAxisHeight = height - y;
    }
    if (legend.visible) {
        const topArea = Math.max(y, legendHeight);
        if (align === 'top') {
            yAxisHeight = height - topArea - (hasXYAxis ? X_AXIS_HEIGHT + xAxisTitleHeight : 0);
        }
        else if (align === 'bottom') {
            yAxisHeight = height - y - X_AXIS_HEIGHT - xAxisTitleHeight - legendHeight;
        }
    }
    if (!((_b = (_a = size) === null || _a === void 0 ? void 0 : _a.yAxis) === null || _b === void 0 ? void 0 : _b.height) && ((_d = (_c = size) === null || _c === void 0 ? void 0 : _c.plot) === null || _d === void 0 ? void 0 : _d.height)) {
        yAxisHeight = size.plot.height;
    }
    return yAxisHeight;
}
function getYAxisRect(yAxisRectParam) {
    var _a, _b;
    const { size, isRightSide = false } = yAxisRectParam;
    const x = getYAxisXPoint(yAxisRectParam);
    const y = getYAxisYPoint(yAxisRectParam);
    const yAxisWidth = getYAxisWidth(yAxisRectParam);
    const yAxisHeight = getYAxisHeight(yAxisRectParam);
    return Object.assign({ x,
        y }, getValidRectSize(isRightSide ? (_a = size) === null || _a === void 0 ? void 0 : _a.secondaryYAxis : (_b = size) === null || _b === void 0 ? void 0 : _b.yAxis, yAxisWidth, yAxisHeight));
}
function getXAxisWidth({ chartSize, yAxis, hasCenterYAxis, legend, circleLegend, secondaryYAxis, xAxisData, }) {
    var _a, _b;
    const { width } = chartSize;
    const { align, width: legendWidth } = legend;
    const legendVerticalAlign = isVerticalAlign(align);
    let xAxisWidth;
    if (legendVerticalAlign) {
        xAxisWidth = width - (yAxis.x + yAxis.width + padding.X);
        if (circleLegend.visible) {
            xAxisWidth -= circleLegend.width;
        }
    }
    else {
        xAxisWidth =
            width - (yAxis.width + Math.max(legendWidth, circleLegend.visible ? circleLegend.width : 0));
    }
    if (hasCenterYAxis) {
        xAxisWidth = width - (legendVerticalAlign ? 0 : legendWidth) - padding.X * 2;
    }
    if (secondaryYAxis.width) {
        xAxisWidth -= secondaryYAxis.width;
    }
    if ((_a = xAxisData) === null || _a === void 0 ? void 0 : _a.extraLabelWidth) {
        xAxisWidth -= (_b = xAxisData) === null || _b === void 0 ? void 0 : _b.extraLabelWidth;
    }
    return xAxisWidth;
}
function getXAxisHeight(xAxisData, hasXYAxis = false) {
    var _a, _b;
    if (!hasXYAxis) {
        return 0;
    }
    return _b = (_a = xAxisData) === null || _a === void 0 ? void 0 : _a.maxHeight, (_b !== null && _b !== void 0 ? _b : X_AXIS_HEIGHT);
}
function getXAxisRect(xAxisRectParam) {
    var _a;
    const { hasXYAxis, hasCenterYAxis, yAxis, size, xAxisData } = xAxisRectParam;
    const x = hasCenterYAxis ? padding.X * 2 : yAxis.x + yAxis.width;
    const y = yAxis.y + yAxis.height;
    const xAxisWidth = getXAxisWidth(xAxisRectParam);
    const xAxisHeight = getXAxisHeight(xAxisData, hasXYAxis);
    return Object.assign({ x,
        y }, getValidRectSize((_a = size) === null || _a === void 0 ? void 0 : _a.xAxis, xAxisWidth, xAxisHeight));
}
function getLegendRect(legendRectParams) {
    const { legend, xAxis, yAxis, chartSize, title, hasXYAxis, secondaryYAxis, xAxisTitleHeight, } = legendRectParams;
    if (!legend.visible) {
        return {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        };
    }
    const { align, width: legendWidth, height: legendHeight } = legend;
    const { width } = chartSize;
    const verticalAlign = isVerticalAlign(align);
    let x = xAxis.x + xAxis.width + secondaryYAxis.width + padding.X;
    let y = Math.max(yAxis.y, BUTTON_RECT_SIZE);
    if (verticalAlign) {
        x = (width - legendWidth) / 2;
        if (align === 'top') {
            y = title.y + title.height;
        }
        else {
            y = yAxis.y + yAxis.height + (hasXYAxis ? xAxis.height + xAxisTitleHeight : padding.Y);
        }
    }
    else if (align === 'left') {
        x = chartPadding.X;
    }
    return { width: legendWidth, height: legendHeight, x, y };
}
function getCircleLegendRect(xAxis, yAxis, align, width) {
    return {
        width,
        height: yAxis.height,
        x: align === 'left' ? padding.X : xAxis.x + xAxis.width + padding.X,
        y: yAxis.y,
    };
}
function getPlotRect(xAxis, yAxis, size) {
    return Object.assign({ x: xAxis.x, y: yAxis.y }, getValidRectSize(size, xAxis.width, yAxis.height));
}
function getTitleRect(chartSize, exportMenu, visible, titleHeight) {
    const point = { x: chartPadding.X, y: chartPadding.Y };
    const marginBottom = 5;
    const width = visible ? chartSize.width - exportMenu.width : 0;
    const height = visible
        ? Math.max(titleHeight + marginBottom, exportMenu.height)
        : exportMenu.height;
    return Object.assign({ width, height }, point);
}
function getTopLegendAreaHeight(useSpectrumLegend, legendHeight) {
    return useSpectrumLegend
        ? SPECTRUM_LEGEND_LABEL_HEIGHT +
            spectrumLegendBar.PADDING * 2 +
            spectrumLegendTooltip.POINT_HEIGHT +
            spectrumLegendTooltip.HEIGHT +
            padding.Y
        : legendHeight + padding.Y;
}
function getYAxisTitleRect({ chartSize, visible, title, legend: { align: legendAlign, width: legendWidth, height: legendHeight, visible: legendVisible, useSpectrumLegend, }, hasCenterYAxis, visibleSecondaryYAxis, isRightSide = false, yAxisTitleHeight, }) {
    const marginBottom = 5;
    const height = visible ? yAxisTitleHeight + marginBottom : 0;
    const verticalLegendAlign = isVerticalAlign(legendAlign);
    const width = (chartSize.width - (verticalLegendAlign ? padding.X * 2 : legendWidth)) /
        (visibleSecondaryYAxis ? 2 : 1);
    const point = {
        x: isRightSide ? title.x + width : title.x,
        y: title.y + title.height,
    };
    if (legendVisible) {
        if (legendAlign === 'left') {
            point.x += legendWidth;
        }
        else if (legendAlign === 'top') {
            point.y += getTopLegendAreaHeight(useSpectrumLegend, legendHeight);
        }
    }
    if (hasCenterYAxis) {
        point.x = (width + padding.X * 2) / 2;
    }
    return Object.assign({ height, width }, point);
}
function getXAxisTitleRect(visible, xAxis, xAxisTitleHeight) {
    const marginTop = 5;
    const point = { x: xAxis.x, y: xAxis.y + xAxis.height + marginTop };
    const height = visible ? xAxisTitleHeight + marginTop : 0;
    const width = visible ? xAxis.width : 0;
    return Object.assign({ height, width }, point);
}
function getExportMenuRect(chartSize, visible) {
    const marginY = 5;
    const x = visible
        ? chartPadding.X + chartSize.width - BUTTON_RECT_SIZE
        : chartPadding.X + chartSize.width;
    const y = chartPadding.Y;
    const height = visible ? BUTTON_RECT_SIZE + marginY : 0;
    const width = visible ? BUTTON_RECT_SIZE : 0;
    return { x, y, height, width };
}
function getResetButtonRect(exportMenu, useResetButton) {
    const marginY = 5;
    const x = useResetButton ? exportMenu.x - BUTTON_RECT_SIZE - chartPadding.X : 0;
    const y = useResetButton ? exportMenu.y : 0;
    const height = useResetButton ? BUTTON_RECT_SIZE + marginY : 0;
    const width = useResetButton ? BUTTON_RECT_SIZE : 0;
    return { x, y, height, width };
}
export function isUsingResetButton(options) {
    var _a;
    return !!((_a = options.series) === null || _a === void 0 ? void 0 : _a.zoomable);
}
export function isExportMenuVisible(options) {
    var _a;
    const visible = (_a = options.exportMenu) === null || _a === void 0 ? void 0 : _a.visible;
    return isUndefined(visible) ? true : visible;
}
function getYAxisMaxLabelWidth(maxLabelLength) {
    if (isUndefined(maxLabelLength) || maxLabelLength === 0) {
        return TICK_SIZE;
    }
    return maxLabelLength + chartPadding.X;
}
function pickOptionSize(option) {
    if (!option || (isUndefined(option.width) && isUndefined(option.height))) {
        return null;
    }
    return pick(option, 'width', 'height');
}
function validOffsetValue(axis, plot, sizeKey) {
    const axisSize = axis[sizeKey];
    const plotSize = plot[sizeKey];
    if (isNumber(axisSize) && isNumber(plotSize)) {
        return Math.max(axisSize, plotSize);
    }
}
function getOptionSize(options) {
    const xAxis = pickOptionSize(options.xAxis);
    const yAxisOptions = getYAxisOption(options);
    const yAxis = pickOptionSize(yAxisOptions.yAxis);
    const secondaryYAxis = pickOptionSize(yAxisOptions.secondaryYAxis);
    const plot = pickOptionSize(options.plot);
    if (plot) {
        /*
        If both the width of the x-axis and the width of the plot are entered,
        set the maximum value.
      */
        if (xAxis) {
            xAxis.width = plot.width = validOffsetValue(xAxis, plot, 'width');
        }
        /*
        If both the height of the y-axis and the height of the plot are entered,
        set the maximum value.
      */
        if (yAxis) {
            yAxis.height = plot.height = validOffsetValue(yAxis, plot, 'height');
        }
        if (secondaryYAxis) {
            secondaryYAxis.height = plot.height = validOffsetValue(secondaryYAxis, plot, 'height');
        }
    }
    return {
        xAxis,
        yAxis,
        plot,
        secondaryYAxis,
    };
}
function getAxisTitleHeight(axisTheme, offsetY = 0) {
    const fontSize = Array.isArray(axisTheme)
        ? Math.max(axisTheme[0].title.fontSize, axisTheme[1].title.fontSize)
        : axisTheme.title.fontSize;
    return fontSize + offsetY;
}
function adjustAxisSize({ width, height }, layout, legendState) {
    if (width < 0 || height < 0) {
        return;
    }
    const { title, yAxisTitle, yAxis, xAxis, xAxisTitle, legend, secondaryYAxis } = layout;
    const { align } = legendState;
    const hasVerticalLegend = isVerticalAlign(align);
    const legendHeight = hasVerticalLegend ? legend.height : 0;
    const diffHeight = xAxis.height +
        xAxisTitle.height +
        yAxis.height +
        yAxisTitle.height +
        title.height +
        legendHeight -
        height;
    yAxis.height -= diffHeight;
    xAxis.y -= diffHeight;
    xAxisTitle.y -= diffHeight;
    if (hasVerticalLegend) {
        legend.y -= diffHeight;
    }
    secondaryYAxis.x = xAxis.x + xAxis.width;
    secondaryYAxis.height = yAxis.height;
}
function getCircularAxisTitleRect(plot, axisTheme, circularAxis) {
    var _a, _b;
    if (!circularAxis) {
        return Object.assign({}, plot);
    }
    const { x, y } = plot;
    const { centerX, centerY, axisSize, title, radius: { outer }, } = circularAxis;
    const offsetY = (_b = (_a = title) === null || _a === void 0 ? void 0 : _a.offsetY, (_b !== null && _b !== void 0 ? _b : 0));
    return {
        x: centerX + x - axisSize / 2,
        y: centerY + y - outer / 2,
        width: axisSize,
        height: axisTheme.title.fontSize + offsetY,
    };
}
function hasXYAxes(series) {
    return !(series.pie || series.radar || series.treemap || series.radialBar || series.gauge);
}
function getYAxisOptions(options, hasXYAxis) {
    return hasXYAxis
        ? getYAxisOption(options)
        : {
            yAxis: null,
            secondaryYAxis: null,
        };
}
const layout = {
    name: 'layout',
    state: () => ({
        layout: {},
    }),
    action: {
        setLayout({ state }) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13;
            const { legend: legendState, theme, circleLegend: circleLegendState, series, options, chart, axes, radialAxes, } = state;
            const { width, height } = chart;
            const labelOnYAxis = isLabelAxisOnYAxis({ series, options });
            const yAxisPadding = labelOnYAxis ? 0 : (_c = (_b = (_a = axes) === null || _a === void 0 ? void 0 : _a.yAxis) === null || _b === void 0 ? void 0 : _b.firstLabelHeight, (_c !== null && _c !== void 0 ? _c : 0)) / 2;
            const chartSize = {
                height: height - yAxisPadding - chartPadding.Y * 2,
                width: width - chartPadding.X * 2,
            };
            const hasCenterYAxis = series.bar ? isCenterYAxis(options) : false;
            const hasXYAxis = hasXYAxes(series);
            const optionSize = getOptionSize(options);
            const { yAxis: yAxisOption, secondaryYAxis: secondaryYAxisOption } = getYAxisOptions(options, hasXYAxis);
            const visibleSecondaryYAxis = !!secondaryYAxisOption;
            const titleHeight = theme.title.fontSize;
            const yAxisTitleHeight = (_g = getAxisTitleHeight(theme.yAxis, (_f = (_e = (_d = axes) === null || _d === void 0 ? void 0 : _d.yAxis) === null || _e === void 0 ? void 0 : _e.title) === null || _f === void 0 ? void 0 : _f.offsetY), (_g !== null && _g !== void 0 ? _g : 0));
            const xAxisTitleHeight = (_l = getAxisTitleHeight(theme.xAxis, (_k = (_j = (_h = axes) === null || _h === void 0 ? void 0 : _h.xAxis) === null || _j === void 0 ? void 0 : _j.title) === null || _k === void 0 ? void 0 : _k.offsetY), (_l !== null && _l !== void 0 ? _l : 0));
            // Don't change the order!
            // exportMenu -> resetButton -> title -> yAxis.title -> yAxis -> secondaryYAxisTitle -> secondaryYAxis -> xAxis -> xAxis.title -> legend -> circleLegend -> plot -> circularAxis.title
            const exportMenu = getExportMenuRect(chartSize, isExportMenuVisible(options));
            const resetButton = getResetButtonRect(exportMenu, isUsingResetButton(options));
            const btnAreaRect = exportMenu.height ? exportMenu : resetButton;
            const title = getTitleRect(chartSize, btnAreaRect, !!((_m = options.chart) === null || _m === void 0 ? void 0 : _m.title), titleHeight);
            const yAxisTitleVisible = !!((_o = yAxisOption) === null || _o === void 0 ? void 0 : _o.title) || !!((_p = secondaryYAxisOption) === null || _p === void 0 ? void 0 : _p.title);
            const xAxisTitleVisible = !!((_q = options.xAxis) === null || _q === void 0 ? void 0 : _q.title);
            const yAxisTitle = getYAxisTitleRect({
                chartSize,
                visible: yAxisTitleVisible,
                title,
                legend: legendState,
                hasCenterYAxis,
                visibleSecondaryYAxis,
                yAxisTitleHeight,
            });
            const yAxis = getYAxisRect(Object.assign(Object.assign({ chartSize, legend: legendState, circleLegend: circleLegendState, yAxisTitle,
                labelOnYAxis,
                hasCenterYAxis,
                hasXYAxis }, (_r = axes) === null || _r === void 0 ? void 0 : _r.yAxis), { maxLabelWidth: getYAxisMaxLabelWidth((_s = axes) === null || _s === void 0 ? void 0 : _s.yAxis.maxLabelWidth), size: optionSize, xAxisTitleHeight: xAxisTitleVisible ? xAxisTitleHeight : 0, xAxisData: (_t = axes) === null || _t === void 0 ? void 0 : _t.xAxis }));
            const secondaryYAxisTitle = getYAxisTitleRect({
                chartSize,
                visible: yAxisTitleVisible,
                title,
                legend: legendState,
                hasCenterYAxis,
                isRightSide: true,
                visibleSecondaryYAxis,
                yAxisTitleHeight,
            });
            const secondaryYAxis = getYAxisRect({
                chartSize,
                legend: legendState,
                circleLegend: circleLegendState,
                yAxisTitle: secondaryYAxisTitle,
                hasCenterYAxis,
                hasXYAxis,
                labelOnYAxis,
                maxLabelWidth: getYAxisMaxLabelWidth((_v = (_u = axes) === null || _u === void 0 ? void 0 : _u.secondaryYAxis) === null || _v === void 0 ? void 0 : _v.maxLabelWidth),
                maxLabelHeight: (_y = (_x = (_w = axes) === null || _w === void 0 ? void 0 : _w.secondaryYAxis) === null || _x === void 0 ? void 0 : _x.maxLabelHeight, (_y !== null && _y !== void 0 ? _y : 0)),
                firstLabelWidth: (_1 = (_0 = (_z = axes) === null || _z === void 0 ? void 0 : _z.secondaryYAxis) === null || _0 === void 0 ? void 0 : _0.firstLabelWidth, (_1 !== null && _1 !== void 0 ? _1 : 0)),
                firstLabelHeight: (_4 = (_3 = (_2 = axes) === null || _2 === void 0 ? void 0 : _2.secondaryYAxis) === null || _3 === void 0 ? void 0 : _3.firstLabelHeight, (_4 !== null && _4 !== void 0 ? _4 : 0)),
                lastLabelWidth: (_7 = (_6 = (_5 = axes) === null || _5 === void 0 ? void 0 : _5.secondaryYAxis) === null || _6 === void 0 ? void 0 : _6.lastLabelWidth, (_7 !== null && _7 !== void 0 ? _7 : 0)),
                lastLabelHeight: (_10 = (_9 = (_8 = axes) === null || _8 === void 0 ? void 0 : _8.secondaryYAxis) === null || _9 === void 0 ? void 0 : _9.lastLabelHeight, (_10 !== null && _10 !== void 0 ? _10 : 0)),
                size: optionSize,
                isRightSide: true,
                visibleSecondaryYAxis,
                xAxisTitleHeight: xAxisTitleVisible ? xAxisTitleHeight : 0,
                xAxisData: (_11 = axes) === null || _11 === void 0 ? void 0 : _11.xAxis,
            });
            const xAxis = getXAxisRect({
                chartSize,
                yAxis,
                secondaryYAxis,
                legend: legendState,
                circleLegend: circleLegendState,
                hasCenterYAxis,
                hasXYAxis,
                size: optionSize,
                xAxisData: (_12 = axes) === null || _12 === void 0 ? void 0 : _12.xAxis,
            });
            const xAxisTitle = getXAxisTitleRect(xAxisTitleVisible, xAxis, xAxisTitleHeight);
            const legend = getLegendRect({
                chartSize,
                xAxis,
                yAxis,
                secondaryYAxis,
                title,
                legend: legendState,
                hasXYAxis,
                xAxisTitleHeight,
            });
            adjustAxisSize(chartSize, { title, yAxisTitle, yAxis, xAxis, xAxisTitle, legend, secondaryYAxis }, legendState);
            const circleLegend = getCircleLegendRect(xAxis, yAxis, legendState.align, circleLegendState.width);
            const plot = getPlotRect(xAxis, yAxis, optionSize.plot);
            const circularAxisTitle = getCircularAxisTitleRect(plot, theme.circularAxis, (_13 = radialAxes) === null || _13 === void 0 ? void 0 : _13.circularAxis);
            extend(state.layout, {
                chart: { x: 0, y: 0, width, height },
                title,
                plot,
                legend,
                circleLegend,
                xAxis,
                xAxisTitle,
                yAxis,
                yAxisTitle,
                exportMenu,
                resetButton,
                secondaryYAxisTitle,
                secondaryYAxis,
                circularAxisTitle,
            });
        },
    },
    observe: {
        updateLayoutObserve() {
            this.dispatch('setLayout');
        },
    },
};
export default layout;
