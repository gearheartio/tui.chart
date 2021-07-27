import { extend } from "./store";
import { rgba } from "../helpers/color";
import { isRangeValue } from "../helpers/range";
import { isString } from "../helpers/utils";
import { doesChartSupportPlotElements, isExistPlotId, shouldFlipPlotLines, } from "../helpers/plot";
function getOverlappingRange(ranges) {
    const overlappingRanges = ranges.reduce((acc, { range }) => {
        const [accStart, accEnd] = acc;
        const [start, end] = range;
        return [Math.min(accStart, start), Math.max(accEnd, end)];
    }, [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]);
    return {
        range: overlappingRanges,
        color: ranges[0].color,
        orientation: ranges[0].orientation,
    };
}
function getCategoryIndex(value, categories) {
    return categories.findIndex((category) => category === String(value));
}
function getValidValue(value, categories, isDateType = false) {
    if (isDateType) {
        return Number(new Date(value));
    }
    if (isString(value)) {
        return getCategoryIndex(value, categories);
    }
    return value;
}
function makePlotLines(categories, isDateType, plotLines = [], shouldFlip = false) {
    return plotLines.map(({ value, color, orientation, opacity, dashSegments, width }) => {
        const isVertical = !orientation || orientation === 'vertical';
        let validValue;
        if (shouldFlip) {
            validValue = isVertical ? value : getValidValue(value, categories, isDateType);
        }
        else {
            validValue = isVertical ? getValidValue(value, categories, isDateType) : value;
        }
        return {
            value: validValue,
            color: rgba(color, opacity),
            orientation: orientation || 'vertical',
            dashSegments,
            width,
        };
    });
}
function makePlotBands(categories, isDateType, plotBands = []) {
    return plotBands.flatMap(({ range, mergeOverlappingRanges = false, color: bgColor, opacity, orientation }) => {
        const color = rgba(bgColor, opacity);
        const rangeArray = (isRangeValue(range[0]) ? range : [range]);
        const ranges = rangeArray.map((rangeData) => ({
            range: rangeData.map((value) => getValidValue(value, categories, isDateType)),
            color,
            orientation: orientation || 'vertical',
        }));
        return mergeOverlappingRanges ? getOverlappingRange(ranges) : ranges;
    });
}
const plot = {
    name: 'plot',
    state: ({ options }) => {
        var _a, _b, _c;
        return ({
            plot: {
                visible: (_c = (_b = (_a = options) === null || _a === void 0 ? void 0 : _a.plot) === null || _b === void 0 ? void 0 : _b.visible, (_c !== null && _c !== void 0 ? _c : true)),
                lines: [],
                bands: [],
            },
        });
    },
    action: {
        setPlot({ state }) {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const { series, options } = state;
            if (!doesChartSupportPlotElements(series)) {
                return;
            }
            const rawCategories = state.rawCategories;
            const lineAreaOptions = options;
            const shouldFlip = shouldFlipPlotLines(series);
            const lines = makePlotLines(rawCategories, !!((_b = (_a = options) === null || _a === void 0 ? void 0 : _a.xAxis) === null || _b === void 0 ? void 0 : _b.date), (_d = (_c = lineAreaOptions) === null || _c === void 0 ? void 0 : _c.plot) === null || _d === void 0 ? void 0 : _d.lines, shouldFlip);
            const bands = makePlotBands(rawCategories, !!((_f = (_e = options) === null || _e === void 0 ? void 0 : _e.xAxis) === null || _f === void 0 ? void 0 : _f.date), (_h = (_g = lineAreaOptions) === null || _g === void 0 ? void 0 : _g.plot) === null || _h === void 0 ? void 0 : _h.bands);
            extend(state.plot, { lines, bands });
        },
        addPlotLine({ state }, { data }) {
            var _a, _b, _c;
            const lines = (_c = (_b = (_a = state.options) === null || _a === void 0 ? void 0 : _a.plot) === null || _b === void 0 ? void 0 : _b.lines, (_c !== null && _c !== void 0 ? _c : []));
            if (!isExistPlotId(lines, data)) {
                this.dispatch('updateOptions', { options: { plot: { lines: [...lines, data] } } });
            }
        },
        addPlotBand({ state }, { data }) {
            var _a, _b, _c;
            const bands = (_c = (_b = (_a = state.options) === null || _a === void 0 ? void 0 : _a.plot) === null || _b === void 0 ? void 0 : _b.bands, (_c !== null && _c !== void 0 ? _c : []));
            if (!isExistPlotId(bands, data)) {
                this.dispatch('updateOptions', { options: { plot: { bands: [...bands, data] } } });
            }
        },
        removePlotLine({ state }, { id }) {
            var _a, _b, _c;
            const lines = (_c = (_b = (_a = state.options) === null || _a === void 0 ? void 0 : _a.plot) === null || _b === void 0 ? void 0 : _b.lines, (_c !== null && _c !== void 0 ? _c : [])).filter(({ id: lineId }) => lineId !== id);
            this.dispatch('updateOptions', { options: { plot: { lines } } });
        },
        removePlotBand({ state }, { id }) {
            var _a, _b, _c;
            const bands = (_c = (_b = (_a = state.options) === null || _a === void 0 ? void 0 : _a.plot) === null || _b === void 0 ? void 0 : _b.bands, (_c !== null && _c !== void 0 ? _c : [])).filter(({ id: bandId }) => bandId !== id);
            this.dispatch('updateOptions', { options: { plot: { bands } } });
        },
    },
    observe: {
        updatePlot() {
            this.dispatch('setPlot');
        },
    },
};
export default plot;
