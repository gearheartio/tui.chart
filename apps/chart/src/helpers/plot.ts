import { PlotLine, PlotBand, GaugePlotBand } from '@t/options';
import { Series } from '@t/store/store';
import { isUndefined } from './utils';

export function isExistPlotId<T extends PlotLine | PlotBand | GaugePlotBand>(plots: T[], data: T) {
  return plots.some(
    ({ id: bandId }) => !isUndefined(bandId) && !isUndefined(data.id) && bandId === data.id
  );
}

export function doesChartSupportPlotElements(series: Series): boolean {
  return !!(series.area || series.line || series.column || series.bar);
}

export function shouldFlipPlotLines(series: Series): boolean {
  return !!series.bar;
}
