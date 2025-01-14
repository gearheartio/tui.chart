import { StoreModule, ValueOf, ChartOptionsMap } from '@t/store/store';
import {
  LineChartOptions,
  AreaChartOptions,
  PlotLine,
  PlotBand,
  PlotRangeType,
  RangeDataType,
} from '@t/options';
import { extend } from './store';
import { rgba } from '@src/helpers/color';
import { isRangeValue } from '@src/helpers/range';
import { isString } from '@src/helpers/utils';
import {
  doesChartSupportPlotElements,
  isExistPlotId,
  shouldFlipPlotLines,
} from '@src/helpers/plot';

type UsingVisiblePlotOptions = ValueOf<
  Omit<
    ChartOptionsMap,
    'radar' | 'pie' | 'treemap' | 'heatmap' | 'nestedPie' | 'radialBar' | 'gauge'
  >
>;

type UsingPlotLineBandOptions = ValueOf<
  Pick<ChartOptionsMap, 'area' | 'line' | 'lineArea' | 'columnLine' | 'column' | 'bar'>
>;

function getOverlappingRange(ranges: PlotBand[]) {
  const overlappingRanges = ranges.reduce<RangeDataType<number>>(
    (acc, { range }) => {
      const [accStart, accEnd] = acc;
      const [start, end] = range as RangeDataType<number>;

      return [Math.min(accStart, start), Math.max(accEnd, end)];
    },
    [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]
  );

  return {
    range: overlappingRanges,
    color: ranges[0].color,
    orientation: ranges[0].orientation,
  };
}

function getCategoryIndex(value: string, categories: string[]) {
  return categories.findIndex((category) => category === String(value));
}

function getValidValue(value: string | number, categories: string[], isDateType = false): number {
  if (isDateType) {
    return Number(new Date(value));
  }

  if (isString(value)) {
    return getCategoryIndex(value, categories);
  }

  return value;
}

function makePlotLines(
  categories: string[],
  isDateType: boolean,
  plotLines: PlotLine[] = [],
  shouldFlip = false
): PlotLine[] {
  return plotLines.map(({ value, color, orientation, opacity, dashSegments, width, name }) => {
    const isVertical = !orientation || orientation === 'vertical';
    let validValue: number | string;
    if (shouldFlip) {
      validValue = isVertical ? value : getValidValue(value, categories, isDateType);
    } else {
      validValue = isVertical ? getValidValue(value, categories, isDateType) : value;
    }

    return {
      value: validValue,
      color: rgba(color, opacity),
      orientation: orientation || 'vertical',
      name,
      dashSegments,
      width,
    };
  });
}

function makePlotBands(
  categories: string[],
  isDateType: boolean,
  plotBands: PlotBand[] = []
): PlotBand[] {
  return plotBands.flatMap(
    ({ range, mergeOverlappingRanges = false, color: bgColor, opacity, orientation }) => {
      const color = rgba(bgColor, opacity);
      const rangeArray = (isRangeValue(range[0]) ? range : [range]) as PlotRangeType[];
      const ranges: PlotBand[] = rangeArray.map((rangeData) => ({
        range: rangeData.map((value) =>
          getValidValue(value, categories, isDateType)
        ) as RangeDataType<number>,
        color,
        orientation: orientation || 'vertical',
      }));

      return mergeOverlappingRanges ? getOverlappingRange(ranges) : ranges;
    }
  );
}

const plot: StoreModule = {
  name: 'plot',
  state: ({ options }) => ({
    plot: {
      visible: (options as UsingVisiblePlotOptions)?.plot?.visible ?? true,
      lines: [],
      bands: [],
    },
  }),
  action: {
    setPlot({ state }) {
      const { series, options } = state;

      if (!doesChartSupportPlotElements(series)) {
        return;
      }

      const rawCategories = state.rawCategories as string[];
      const lineAreaOptions = options as LineChartOptions | AreaChartOptions;

      const shouldFlip = shouldFlipPlotLines(series);

      const lines = makePlotLines(
        rawCategories,
        !!options?.xAxis?.date,
        lineAreaOptions?.plot?.lines,
        shouldFlip
      );

      const bands = makePlotBands(
        rawCategories,
        !!options?.xAxis?.date,
        lineAreaOptions?.plot?.bands
      );

      extend(state.plot, { lines, bands });
    },
    addPlotLine({ state }, { data }: { data: PlotLine }) {
      const lines = (state.options as UsingPlotLineBandOptions)?.plot?.lines ?? [];
      if (!isExistPlotId(lines, data)) {
        this.dispatch('updateOptions', { options: { plot: { lines: [...lines, data] } } });
      }
    },
    addPlotBand({ state }, { data }: { data: PlotBand }) {
      const bands = (state.options as UsingPlotLineBandOptions)?.plot?.bands ?? [];
      if (!isExistPlotId(bands, data)) {
        this.dispatch('updateOptions', { options: { plot: { bands: [...bands, data] } } });
      }
    },
    removePlotLine({ state }, { id }: { id: string }) {
      const lines = ((state.options as UsingPlotLineBandOptions)?.plot?.lines ?? []).filter(
        ({ id: lineId }) => lineId !== id
      );
      this.dispatch('updateOptions', { options: { plot: { lines } } });
    },
    removePlotBand({ state }, { id }: { id: string }) {
      const bands = ((state.options as UsingPlotLineBandOptions)?.plot?.bands ?? []).filter(
        ({ id: bandId }) => bandId !== id
      );
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
