import { isUndefined } from "./utils";
export function isExistPlotId(plots, data) {
    return plots.some(({ id: bandId }) => !isUndefined(bandId) && !isUndefined(data.id) && bandId === data.id);
}
export function doesChartSupportPlotElements(series) {
    return !!(series.area || series.line || series.column || series.bar);
}
export function shouldFlipPlotLines(series) {
    return !!series.bar;
}
