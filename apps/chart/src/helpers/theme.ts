import { RawSeries } from '@t/store/store';
import { Theme, CheckAnchorPieSeries } from '@t/theme';
import { getNestedPieChartAliasNames } from '@src/helpers/pieSeries';
import { includes } from './utils';

export const DEFAULT_LINE_SERIES_WIDTH = 2;
export const DEFAULT_LINE_SERIES_DOT_RADIUS = 3;
const DEFAULT_AREA_OPACITY = 0.3;
const DEFAULT_AREA_SELECTED_SERIES_OPACITY = DEFAULT_AREA_OPACITY;
const DEFAULT_AREA_UNSELECTED_SERIES_OPACITY = 0.06;

export const radarDefault = {
  LINE_WIDTH: 2,
  DOT_RADIUS: 3,
  HOVER_DOT_RADIUS: 4,
  SELECTED_SERIES_OPACITY: 0.3,
  UNSELECTED_SERIES_OPACITY: 0.05,
};

export const boxDefault = {
  HOVER_THICKNESS: 4,
  BOX_HOVER: {
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffsetX: 2,
    shadowOffsetY: 2,
    shadowBlur: 6,
  },
};

const boxplotDefault = {
  OUTLIER_RADIUS: 4,
  OUTLIER_BORDER_WIDTH: 2,
  LINE_TYPE: {
    whisker: { lineWidth: 1 },
    maximum: { lineWidth: 1 },
    minimum: { lineWidth: 1 },
    median: { lineWidth: 1, color: '#ffffff' },
  },
};

export const DEFAULT_BULLET_RANGE_OPACITY = [0.5, 0.3, 0.1];
const DEFAULT_PIE_LINE_WIDTH = 3;

function makeDefaultDataLabelsTheme(globalFontFamily = 'Arial') {
  return {
    fontFamily: globalFontFamily,
    fontSize: 11,
    fontWeight: 400,
    color: '#333333',
    useSeriesColor: false,
  };
}

const DEFAULT_BUBBLE_ARROW = {
  width: 8,
  height: 6,
};

export const defaultSeriesTheme = {
  colors: [
    '#00a9ff',
    '#ffb840',
    '#ff5a46',
    '#00bd9f',
    '#785fff',
    '#f28b8c',
    '#989486',
    '#516f7d',
    '#28e6eb',
    '#28695f',
    '#96c85a',
    '#45ba3f',
    '#295ba0',
    '#2a4175',
    '#289399',
    '#66c8d3',
    '#617178',
    '#8a9a9a',
    '#bebebe',
    '#374b5a',
    '#64eba0',
    '#ffe155',
    '#ff9141',
    '#af4beb',
    '#ff73fa',
    '#ff55b2',
    '#2869f5',
    '#3296ff',
    '#8cc3ff',
    '#2828b9',
    '#fa8787',
    '#e13782',
    '#7d5aaa',
    '#643c91',
    '#d25f5f',
    '#fabe6e',
    '#c3a9eb',
    '#b9c8f5',
    '#73a0cd',
    '#0f5a8c',
  ],
  startColor: '#ffe98a',
  endColor: '#d74177',
  lineWidth: DEFAULT_LINE_SERIES_WIDTH,
  dashSegments: [],
  borderWidth: 0,
  borderColor: '#ffffff',
  select: {
    dot: {
      radius: DEFAULT_LINE_SERIES_DOT_RADIUS,
      borderWidth: DEFAULT_LINE_SERIES_DOT_RADIUS + 2,
    },
    areaOpacity: DEFAULT_AREA_SELECTED_SERIES_OPACITY,
    restSeries: {
      areaOpacity: DEFAULT_AREA_UNSELECTED_SERIES_OPACITY,
    },
  },
  hover: {
    dot: {
      radius: DEFAULT_LINE_SERIES_DOT_RADIUS,
      borderWidth: DEFAULT_LINE_SERIES_DOT_RADIUS + 2,
    },
  },
  dot: {
    radius: DEFAULT_LINE_SERIES_DOT_RADIUS,
  },
  areaOpacity: DEFAULT_AREA_OPACITY,
};

export function makeAxisTitleTheme(globalFontFamily = 'Arial') {
  return {
    fontSize: 11,
    fontFamily: globalFontFamily,
    fontWeight: 700,
    color: '#bbbbbb',
  };
}

export function makeCommonTextTheme(globalFontFamily = 'Arial') {
  return { fontSize: 11, fontFamily: globalFontFamily, fontWeight: 'normal', color: '#333333' };
}

export function makeDefaultTheme(series: RawSeries, globalFontFamily = 'Arial') {
  const axisTitleTheme = makeAxisTitleTheme(globalFontFamily);
  const commonTextTheme = makeCommonTextTheme(globalFontFamily);
  const hasRadarSeries = !!series?.radar;
  const hasGaugeSeries = !!series?.gauge;

  return {
    chart: {
      fontFamily: globalFontFamily,
      backgroundColor: '#ffffff',
    },
    noData: {
      fontSize: 18,
      fontFamily: globalFontFamily,
      fontWeight: 'normal',
      color: '#333333',
    },
    title: {
      fontSize: 18,
      fontFamily: globalFontFamily,
      fontWeight: 100,
      color: '#333333',
    },
    yAxis: {
      title: { ...axisTitleTheme },
      label: { ...commonTextTheme },
      width: 1,
      color: '#333333',
    },
    xAxis: {
      title: { ...axisTitleTheme },
      label: { ...commonTextTheme },
      width: 1,
      color: '#333333',
    },
    verticalAxis: {
      label: {
        ...commonTextTheme,
        textBubble: {
          visible: hasRadarSeries,
          backgroundColor: hasRadarSeries ? '#f3f3f3' : 'rgba(0, 0, 0, 0)',
          borderRadius: 7,
          paddingX: 7,
          paddingY: 2,
          borderColor: 'rgba(0, 0, 0, 0)',
          borderWidth: 1,
        },
      },
    },
    circularAxis: {
      title: { ...axisTitleTheme },
      label: { ...commonTextTheme },
      lineWidth: 1,
      strokeStyle: hasGaugeSeries ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.05)',
      dotColor: 'rgba(0, 0, 0, 0.5)',
      tick: {
        lineWidth: 1,
        strokeStyle: 'rgba(0, 0, 0, 0.5)',
      },
    },
    legend: {
      label: {
        color: '#333333',
        fontSize: 11,
        fontWeight: 'normal',
        fontFamily: globalFontFamily,
      },
    },
    tooltip: {
      background: 'rgba(85, 85, 85, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0)',
      borderWidth: 0,
      borderRadius: 3,
      borderStyle: 'solid',
      body: {
        fontSize: 12,
        fontFamily: `${globalFontFamily}, sans-serif`,
        fontWeight: 'normal',
        color: '#ffffff',
      },
      header: {
        fontSize: 13,
        fontFamily: `${globalFontFamily}, sans-serif`,
        fontWeight: 'bold',
        color: '#ffffff',
      },
    },
    plot: {
      lineColor: 'rgba(0, 0, 0, 0.05)',
      backgroundColor: 'rgba(255, 255, 255, 0)',
    },
    exportMenu: {
      button: {
        ...makeBorderTheme(5, '#f4f4f4'),
        backgroundColor: '#f4f4f4',
        xIcon: {
          color: '#555555',
          lineWidth: 2,
        },
        dotIcon: {
          color: '#555555',
          width: 2,
          height: 2,
          gap: 2,
        },
      },
      panel: {
        ...makeBorderTheme(0, '#bab9ba'),
        header: {
          ...commonTextTheme,
          backgroundColor: '#f4f4f4',
        },
        body: {
          ...commonTextTheme,
          backgroundColor: '#ffffff',
        },
      },
    },
  } as Theme;
}

function makeBorderTheme(borderRadius, borderColor, borderWidth = 1) {
  return { borderWidth, borderRadius, borderColor };
}

function makeDefaultTextBubbleTheme(
  visible = false,
  borderRadius = 7,
  paddingX = 5,
  paddingY = 1,
  backgroundColor = '#ffffff'
) {
  return {
    visible,
    paddingX,
    paddingY,
    borderRadius,
    backgroundColor,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffsetY: 2,
    shadowBlur: 4,
  };
}

function getLineTypeSeriesTheme(globalFontFamily: string) {
  const defaultDataLabelTheme = makeDefaultDataLabelsTheme(globalFontFamily);

  return {
    lineWidth: defaultSeriesTheme.lineWidth,
    dashSegments: defaultSeriesTheme.dashSegments,
    select: { dot: defaultSeriesTheme.select.dot },
    hover: { dot: defaultSeriesTheme.hover.dot },
    dot: defaultSeriesTheme.dot,
    dataLabels: {
      ...defaultDataLabelTheme,
      textBubble: {
        ...makeDefaultTextBubbleTheme(),
        arrow: { visible: false, direction: 'bottom', ...DEFAULT_BUBBLE_ARROW },
      },
    },
  };
}

function getTreemapHeatmapSeriesTheme(globalFontFamily: string) {
  const defaultDataLabelTheme = makeDefaultDataLabelsTheme(globalFontFamily);

  return {
    startColor: defaultSeriesTheme.startColor,
    endColor: defaultSeriesTheme.endColor,
    borderWidth: 0,
    borderColor: '#ffffff',
    hover: {
      borderWidth: boxDefault.HOVER_THICKNESS,
      borderColor: '#ffffff',
    },
    select: {
      borderWidth: boxDefault.HOVER_THICKNESS,
      borderColor: '#ffffff',
    },
    dataLabels: {
      ...defaultDataLabelTheme,
      color: '#ffffff',
      textBubble: {
        ...makeDefaultTextBubbleTheme(false, 1, 5, 1, 'rgba(255, 255, 255, 0.5)'),
      },
    },
  };
}

function getBarColumnSeriesTheme(globalFontFamily: string) {
  const defaultDataLabelTheme = makeDefaultDataLabelsTheme(globalFontFamily);

  return {
    colorByPoint: false,
    areaOpacity: 1,
    hover: {
      ...boxDefault.BOX_HOVER,
      borderWidth: boxDefault.HOVER_THICKNESS,
      borderColor: '#ffffff',
      groupedRect: {
        color: '#000000',
        opacity: 0.05,
      },
    },
    select: {
      ...boxDefault.BOX_HOVER,
      borderWidth: boxDefault.HOVER_THICKNESS,
      borderColor: '#ffffff',
      groupedRect: {
        color: '#000000',
        opacity: 0.2,
      },
      restSeries: {
        areaOpacity: 0.2,
      },
      areaOpacity: 1,
    },
    connector: {
      color: 'rgba(51, 85, 139, 0.3)',
      lineWidth: 1,
      dashSegments: [],
    },
    dataLabels: {
      ...defaultDataLabelTheme,
      textBubble: {
        ...makeDefaultTextBubbleTheme(false, 1, 4, 3),
        arrow: { visible: false, ...DEFAULT_BUBBLE_ARROW },
      },
      stackTotal: {
        ...defaultDataLabelTheme,
        textBubble: {
          ...makeDefaultTextBubbleTheme(true, 1, 4, 3),
          arrow: { visible: true, ...DEFAULT_BUBBLE_ARROW },
        },
      },
    },
  };
}

const transparentColor = 'rgba(255, 255, 255, 0)';
const defaultThemeMakers = {
  line: (globalFontFamily: string) => ({ ...getLineTypeSeriesTheme(globalFontFamily) }),
  area: (globalFontFamily: string) => {
    const lineTypeSeriesTheme = getLineTypeSeriesTheme(globalFontFamily);

    return {
      ...lineTypeSeriesTheme,
      select: {
        ...lineTypeSeriesTheme.select,
        areaOpacity: DEFAULT_AREA_SELECTED_SERIES_OPACITY,
        restSeries: defaultSeriesTheme.select.restSeries,
      },
      areaOpacity: DEFAULT_AREA_OPACITY,
    };
  },
  treemap: (globalFontFamily: string) => getTreemapHeatmapSeriesTheme(globalFontFamily),
  heatmap: (globalFontFamily: string) => getTreemapHeatmapSeriesTheme(globalFontFamily),
  scatter: () => ({
    size: 12,
    borderWidth: 1.5,
    fillColor: transparentColor,
    select: {
      fillColor: 'rgba(255, 255, 255, 1)',
      borderWidth: 2.5,
      size: 12,
    },
    hover: {
      fillColor: 'rgba(255, 255, 255, 1)',
      borderWidth: 2.5,
      size: 12,
    },
  }),
  bubble: () => ({
    borderWidth: 0,
    borderColor: transparentColor,
    select: {},
    hover: {
      shadowColor: 'rgba(0, 0, 0, 0.3)',
      shadowBlur: 2,
      shadowOffsetY: 2,
      lineWidth: 2,
    },
  }),
  radar: () => ({
    areaOpacity: radarDefault.SELECTED_SERIES_OPACITY,
    hover: {
      dot: {
        radius: radarDefault.HOVER_DOT_RADIUS,
        borderWidth: radarDefault.HOVER_DOT_RADIUS + 1,
      },
    },
    select: {
      dot: {
        radius: radarDefault.HOVER_DOT_RADIUS,
        borderWidth: radarDefault.HOVER_DOT_RADIUS + 1,
      },
      restSeries: {
        areaOpacity: radarDefault.UNSELECTED_SERIES_OPACITY,
      },
      areaOpacity: radarDefault.SELECTED_SERIES_OPACITY,
    },
    dot: {
      radius: radarDefault.DOT_RADIUS,
    },
  }),
  bar: (globalFontFamily: string) => ({ ...getBarColumnSeriesTheme(globalFontFamily) }),
  column: (globalFontFamily: string) => ({ ...getBarColumnSeriesTheme(globalFontFamily) }),
  bullet: (globalFontFamily: string) => {
    const defaultDataLabelTheme = makeDefaultDataLabelsTheme(globalFontFamily);

    return {
      areaOpacity: 1,
      barWidthRatios: {
        rangeRatio: 1,
        bulletRatio: 0.5,
        markerRatio: 0.8,
      },
      markerLineWidth: 1,
      borderWidth: 0,
      borderColor: 'rgba(255, 255, 255, 0)',
      hover: {
        ...boxDefault.BOX_HOVER,
        borderWidth: boxDefault.HOVER_THICKNESS,
        borderColor: '#ffffff',
        groupedRect: {
          color: '#000000',
          opacity: 0.05,
        },
      },
      select: {
        ...boxDefault.BOX_HOVER,
        borderWidth: boxDefault.HOVER_THICKNESS,
        borderColor: '#ffffff',
        groupedRect: {
          color: '#000000',
          opacity: 0.2,
        },
        restSeries: {
          areaOpacity: 0.2,
        },
        areaOpacity: 1,
      },
      dataLabels: {
        ...defaultDataLabelTheme,
        textBubble: {
          ...makeDefaultTextBubbleTheme(),
          arrow: { visible: false, ...DEFAULT_BUBBLE_ARROW },
        },
        marker: {
          ...defaultDataLabelTheme,
          fontSize: 9,
          useSeriesColor: true,
          textBubble: {
            ...makeDefaultTextBubbleTheme(true),
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            shadowColor: 'rgba(0, 0, 0, 0.0)',
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowBlur: 0,
            arrow: { visible: false, ...DEFAULT_BUBBLE_ARROW },
          },
        },
      },
    };
  },
  boxPlot: () => ({
    areaOpacity: 1,
    barWidthRatios: {
      barRatio: 1,
      minMaxBarRatio: 0.5,
    },
    markerLineWidth: 1,
    dot: {
      color: '#ffffff',
      radius: boxplotDefault.OUTLIER_RADIUS,
      borderWidth: boxplotDefault.OUTLIER_BORDER_WIDTH,
      useSeriesColor: false,
    },
    rect: { borderWidth: 0 },
    line: { ...boxplotDefault.LINE_TYPE },
    hover: {
      ...boxDefault.BOX_HOVER,
      rect: { borderWidth: boxDefault.HOVER_THICKNESS, borderColor: '#ffffff' },
      dot: {
        radius: boxplotDefault.OUTLIER_RADIUS,
        borderWidth: 0,
        useSeriesColor: true,
      },
      line: { ...boxplotDefault.LINE_TYPE },
    },
    select: {
      ...boxDefault.BOX_HOVER,
      rect: { borderWidth: boxDefault.HOVER_THICKNESS, borderColor: '#ffffff' },
      dot: {
        radius: boxplotDefault.OUTLIER_RADIUS,
        borderWidth: 0,
        useSeriesColor: true,
      },
      line: { ...boxplotDefault.LINE_TYPE },
      restSeries: {
        areaOpacity: 0.2,
      },
      areaOpacity: 1,
    },
  }),
  pie: (
    globalFontFamily: string,
    { hasOuterAnchor = false, hasOuterAnchorPieSeriesName = false },
    isNestedPieChart = false
  ) => {
    const defaultDataLabelTheme = makeDefaultDataLabelsTheme(globalFontFamily);

    return {
      areaOpacity: 1,
      strokeStyle: isNestedPieChart ? '#ffffff' : 'rgba(255, 255, 255, 0)',
      lineWidth: isNestedPieChart ? 1 : 0,
      hover: {
        lineWidth: DEFAULT_PIE_LINE_WIDTH,
        strokeStyle: '#ffffff',
        shadowColor: '#cccccc',
        shadowBlur: 5,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
      },
      select: {
        lineWidth: DEFAULT_PIE_LINE_WIDTH,
        strokeStyle: '#ffffff',
        shadowColor: '#cccccc',
        shadowBlur: 5,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        restSeries: {
          areaOpacity: 0.3,
        },
        areaOpacity: 1,
      },
      dataLabels: {
        fontFamily: globalFontFamily,
        fontSize: 16,
        fontWeight: 600,
        color: hasOuterAnchor ? '#333333' : '#ffffff',
        useSeriesColor: hasOuterAnchor,
        textBubble: { ...makeDefaultTextBubbleTheme(false, 0) },
        callout: {
          lineWidth: 1,
          useSeriesColor: true,
          lineColor: '#e9e9e9',
        },
        pieSeriesName: {
          ...defaultDataLabelTheme,
          useSeriesColor: hasOuterAnchorPieSeriesName,
          color: hasOuterAnchorPieSeriesName ? '#333333' : '#ffffff',
          textBubble: { ...makeDefaultTextBubbleTheme(false, 0) },
        },
      },
    };
  },
  radialBar: (globalFontFamily: string) => ({
    areaOpacity: 1,
    strokeStyle: 'rgba(255, 255, 255, 0)',
    lineWidth: 0,
    hover: {
      lineWidth: DEFAULT_PIE_LINE_WIDTH,
      strokeStyle: '#fff',
      shadowColor: '#cccccc',
      shadowBlur: 5,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      groupedSector: {
        color: '#000000',
        opacity: 0.05,
      },
    },
    select: {
      lineWidth: DEFAULT_PIE_LINE_WIDTH,
      strokeStyle: '#fff',
      shadowColor: '#cccccc',
      shadowBlur: 5,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      restSeries: {
        areaOpacity: 0.3,
      },
      areaOpacity: 1,
      groupedSector: {
        color: '#000000',
        opacity: 0.2,
      },
    },
    dataLabels: {
      fontFamily: globalFontFamily,
      fontSize: 11,
      fontWeight: 400,
      color: '#333333',
      useSeriesColor: false,
      textBubble: { ...makeDefaultTextBubbleTheme(false, 0) },
    },
  }),
  gauge: (globalFontFamily: string) => ({
    areaOpacity: 1,
    hover: {
      clockHand: { baseLine: 5 },
      pin: { radius: 5, borderWidth: 5 },
      solid: {
        lineWidth: DEFAULT_PIE_LINE_WIDTH,
        strokeStyle: '#ffffff',
        shadowColor: '#cccccc',
        shadowBlur: 5,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
      },
    },
    select: {
      clockHand: { baseLine: 5 },
      pin: { radius: 6, borderWidth: 4 },
      solid: {
        lineWidth: DEFAULT_PIE_LINE_WIDTH,
        strokeStyle: '#ffffff',
        shadowColor: '#cccccc',
        shadowBlur: 5,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        restSeries: {
          areaOpacity: 0.3,
        },
        areaOpacity: 1,
      },
      areaOpacity: 1,
      restSeries: { areaOpacity: 0.3 },
    },
    clockHand: { baseLine: 4 },
    pin: { radius: 5, borderWidth: 5 },
    solid: {
      lineWidth: 0,
      backgroundSolid: { color: 'rgba(0, 0, 0, 0.1)' },
    },
    dataLabels: {
      fontFamily: globalFontFamily,
      fontSize: 11,
      fontWeight: 400,
      color: '#333333',
      useSeriesColor: false,
      textBubble: {
        ...makeDefaultTextBubbleTheme(true, 4, 4, 3),
        shadowColor: 'rgba(0, 0, 0, 0)',
        shadowOffsetY: 0,
        shadowBlur: 0,
        borderColor: '#ccc',
        borderWidth: 1,
      },
    },
  }),
};

function getSeriesTheme(
  globalFontFamily: string,
  seriesName: string,
  paramForPieSeries: CheckAnchorPieSeries,
  isNestedPieChart = false
) {
  if (seriesName === 'pie') {
    return defaultThemeMakers[seriesName](globalFontFamily, paramForPieSeries, isNestedPieChart);
  }

  if (includes(['bubble', 'radar', 'boxPlot'], seriesName)) {
    return defaultThemeMakers[seriesName]();
  }

  return defaultThemeMakers[seriesName](globalFontFamily);
}

export function getDefaultTheme(
  series: RawSeries,
  pieSeriesOuterAnchors: CheckAnchorPieSeries | Record<string, CheckAnchorPieSeries>,
  globalFontFamily = 'Arial',
  isNestedPieChart = false
): Theme {
  const result = Object.keys(series).reduce<Theme>(
    (acc, seriesName) => ({
      ...acc,
      series: {
        ...acc.series,
        [seriesName]: getSeriesTheme(
          globalFontFamily,
          seriesName,
          pieSeriesOuterAnchors as CheckAnchorPieSeries
        ),
      },
    }),
    makeDefaultTheme(series, globalFontFamily) as Theme
  );

  if (isNestedPieChart) {
    const aliasNames = getNestedPieChartAliasNames(series);

    result.series.pie = aliasNames.reduce(
      (acc, cur) => ({
        ...acc,
        [cur]: getSeriesTheme(
          globalFontFamily,
          'pie',
          pieSeriesOuterAnchors[cur],
          isNestedPieChart
        ),
      }),
      {}
    );
  }

  return result;
}
