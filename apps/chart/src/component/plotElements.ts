import { shouldFlipPlotLines } from '@src/helpers/plot';
import { getTitleFontString } from '@src/helpers/style';
import { makeCommonTextTheme } from '@src/helpers/theme';
import { LabelStyle, LabelStyleName } from '@t/brushes';
import { PlotElementsModels } from '@t/components/plotElements';
import Component from './component';
import { ChartState, Options, Axes, ValueEdge, LabelAxisData, Scale } from '@t/store/store';
import {
  crispPixel,
  makeTickPixelPositions,
  getXGroupedPosition,
  getYLinearPosition,
  getXLinearPosition,
  getYGroupedPosition, getTextHeight, getTextWidth,
} from '@src/helpers/calculator';
import { LabelModel, LineModel } from '@t/components/axis';
import { RectModel, StyleProp } from '@t/components/series';
import { PlotLine, PlotBand, PlotRangeType } from '@t/options';
import { PlotTheme, LineTheme } from '@t/theme';
import { pick } from '@src/helpers/utils';

type PositionParam = {
  axisData: LabelAxisData;
  offsetSize: number;
  value: number | string;
  xAxisLimit?: ValueEdge;
  categories: string[];
  startIndex: number;
  scale: Scale;
  shouldFlip: boolean;
  vertical: boolean;
};

const lineLabelXOffsetPx = 12;
const lineLabelYOffsetPx = 15;

function getValidIndex(index: number, startIndex = 0): number {
  return ~~index ? index - startIndex : index;
}

function validXPosition({
  axisData,
  offsetSize,
  value,
  shouldFlip,
  scale,
  startIndex = 0,
}: PositionParam) {
  let xPosition: number;
  if (shouldFlip) {
    xPosition = getXLinearPosition(axisData, offsetSize, value as number, scale);
  } else {
    const dataIndex = getValidIndex(value as number, startIndex);
    xPosition = getXGroupedPosition(axisData, offsetSize, value, dataIndex);
  }

  return xPosition > 0 ? Math.min(offsetSize, xPosition) : 0;
}

function validYPosition({
  axisData,
  offsetSize,
  value,
  shouldFlip,
  scale,
  startIndex = 0,
}: PositionParam) {
  let yPosition: number;
  if (shouldFlip) {
    const dataIndex = getValidIndex(value as number, startIndex);
    yPosition = getYGroupedPosition(axisData, offsetSize, value, dataIndex);
  } else {
    yPosition = getYLinearPosition(axisData, offsetSize, value as number, scale);
  }

  return yPosition > 0 ? Math.min(offsetSize, yPosition) : 0;
}

function validPosition(params: PositionParam) {
  let position: number;
  if (params.vertical) {
    position = validXPosition(params);
  } else {
    position = validYPosition(params);
  }

  return position;
}

function getPlotAxisData(vertical: boolean, axes: Axes) {
  return vertical ? axes.xAxis : axes.yAxis;
}

export default class PlotElements extends Component {
  models: PlotElementsModels = { line: [], band: [], label: [] };

  startIndex = 0;

  theme!: Required<PlotTheme>;

  initialize() {
    this.type = 'plot-elements';
  }

  getPlotAxisSize(vertical: boolean) {
    return {
      offsetSize: vertical ? this.rect.width : this.rect.height,
      anchorSize: vertical ? this.rect.height : this.rect.width,
    };
  }

  renderLines(
    axes: Axes,
    categories: string[],
    scale: Scale,
    lines: PlotLine[] = [],
    shouldFlip = false
  ): LineModel[] {
    return lines.map(({ value, color, orientation, dashSegments, width, name }) => {
      const vertical = !orientation || orientation === 'vertical';
      const { offsetSize } = this.getPlotAxisSize(vertical);
      const position = validPosition({
        vertical,
        axisData: getPlotAxisData(vertical, axes) as LabelAxisData,
        offsetSize,
        value,
        categories,
        startIndex: this.startIndex,
        scale,
        shouldFlip,
      });

      return this.makeLineModel(vertical, position, {
        color,
        dashSegments,
        lineWidth: width,
        name,
      });
    });
  }

  renderBands(
    axes: Axes,
    categories: string[],
    scale: Scale,
    bands: PlotBand[] = [],
    shouldFlip = false
  ): RectModel[] {
    return bands.map(({ range, color, orientation }: PlotBand) => {
      const vertical = !orientation || orientation === 'vertical';
      const { offsetSize, anchorSize } = this.getPlotAxisSize(vertical);
      const [start, end] = (range as PlotRangeType).map((value) => {
        return validPosition({
          vertical,
          axisData: getPlotAxisData(vertical, axes) as LabelAxisData,
          offsetSize,
          value,
          categories,
          startIndex: this.startIndex,
          scale,
          shouldFlip,
        });
      });

      return this.makeBandModel(vertical, start, end, anchorSize, color);
    });
  }

  renderPlotLineModels(
    relativePositions: number[],
    vertical: boolean,
    options: { size?: number; startPosition?: number; axes?: Axes } = {}
  ): LineModel[] {
    const { size, startPosition, axes } = options;

    const { lineColor: color, lineWidth, dashSegments } = this.theme[
      vertical ? 'vertical' : 'horizontal'
    ] as Required<LineTheme>;
    const tickInterval = (vertical ? axes?.xAxis : axes?.yAxis)?.tickInterval || 1;

    return relativePositions
      .filter((_, idx) => !(idx % tickInterval))
      .map((position) =>
        this.makeLineModel(
          vertical,
          position,
          { color, lineWidth, dashSegments },
          size ?? this.rect.width,
          startPosition ?? 0
        )
      );
  }

  renderPlotsForCenterYAxis(axes: Axes): LineModel[] {
    const { xAxisHalfSize, secondStartX, yAxisHeight } = axes.centerYAxis!;

    // vertical
    const xAxisTickCount = axes.xAxis.tickCount!;
    const verticalLines = [
      ...this.renderPlotLineModels(makeTickPixelPositions(xAxisHalfSize, xAxisTickCount), true),
      ...this.renderPlotLineModels(
        makeTickPixelPositions(xAxisHalfSize, xAxisTickCount, secondStartX),
        true
      ),
    ];

    // horizontal
    const yAxisTickCount = axes.yAxis.tickCount!;
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

  renderPlots(axes: Axes, scale?: Scale): LineModel[] {
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

  getVerticalTickPixelPositions(axes: Axes, scale?: Scale) {
    const { offsetSize } = this.getPlotAxisSize(true);
    const axisData = getPlotAxisData(true, axes);
    if ((axisData as LabelAxisData)?.labelRange) {
      const sizeRatio = scale?.xAxis?.sizeRatio ?? 1;
      const positionRatio = scale?.xAxis?.positionRatio ?? 0;
      const axisSizeAppliedRatio = offsetSize * sizeRatio;
      const additional = offsetSize * positionRatio;

      return makeTickPixelPositions(axisSizeAppliedRatio, axisData.tickCount, additional);
    }

    return makeTickPixelPositions(offsetSize, axisData.tickCount);
  }

  getHorizontalTickPixelPositions(axes: Axes) {
    const { offsetSize } = this.getPlotAxisSize(false);
    const axisData = getPlotAxisData(false, axes);

    return makeTickPixelPositions(offsetSize, axisData.tickCount);
  }

  renderPlotBackgroundRect(): RectModel {
    return {
      type: 'rect',
      x: 0,
      y: 0,
      ...pick(this.rect, 'width', 'height'),
      color: this.theme.backgroundColor,
    };
  }

  render(state: ChartState<Options>) {
    const { layout, series, axes, plot, zoomRange, theme, scale } = state;

    if (!plot) {
      return;
    }

    this.rect = layout.plot;
    this.startIndex = zoomRange?.[0] ?? 0;
    this.theme = theme.plot! as Required<PlotTheme>;

    const categories = (state.categories as string[]) ?? [];
    const { lines, bands } = plot;
    const flipLines = shouldFlipPlotLines(series);

    this.models.line = this.renderLines(axes, categories, scale, lines, flipLines);
    this.models.band = this.renderBands(axes, categories, scale, bands, flipLines);
    this.models.label = this.renderLabelModels(this.models.line);
  }

  makeLineModel(
    vertical: boolean,
    position: number,
    {
      color,
      dashSegments = [],
      name,
      lineWidth = 1,
    }: { color: string; name?: string; dashSegments?: number[]; lineWidth?: number },
    sizeWidth?: number,
    xPos = 0
  ): LineModel {
    const x = vertical ? crispPixel(position) : crispPixel(xPos);
    const y = vertical ? crispPixel(0) : crispPixel(position);
    const width = vertical ? 0 : sizeWidth ?? this.rect.width;
    const height = vertical ? this.rect.height : 0;

    return {
      type: 'line',
      x,
      y,
      x2: x + width,
      y2: y + height,
      name,
      strokeStyle: color,
      lineWidth,
      dashSegments,
    };
  }

  makeBandModel(
    vertical: boolean,
    start: number,
    end: number,
    anchorSize: number,
    color: string
  ): RectModel {
    const x = vertical ? crispPixel(start) : crispPixel(0);
    const y = vertical ? crispPixel(0) : crispPixel(start);
    const width = vertical ? end - start : anchorSize;
    const height = vertical ? anchorSize : end - start;

    return { type: 'rect', x, y, width, height, color };
  }

  renderLabelModels(lineModels: LineModel[]): LabelModel[] {
    const font = makeCommonTextTheme();
    font.fontWeight = 'bold';
    const textAlign = 'left';
    const fontString = getTitleFontString(font);
    const style: StyleProp<LabelStyle, LabelStyleName> = [
      'default',
      { textAlign, font: getTitleFontString(font), fillStyle: 'black' },
    ];

    return lineModels.map((lineModel) => {
      const name = lineModel.name ?? '';
      const textHeight = getTextHeight(name, fontString);
      const textWidth = getTextWidth(name, fontString);
      const { x, y } = this.getLabelCoords(lineModel, textHeight, textWidth);

      return {
        type: 'label',
        text: name,
        style,
        x,
        y,
      };
    });
  }

  private getLabelCoords(
    lineModel: LineModel,
    textHeight: number,
    textWidth: number
  ): { x: number; y: number } {
    const isVertical = lineModel.x === lineModel.x2;
    const fitsHorizontally = lineModel.x + lineLabelXOffsetPx + textWidth < this.rect.width;
    const x = fitsHorizontally
      ? lineModel.x + lineLabelXOffsetPx
      : lineModel.x - lineLabelXOffsetPx - textWidth;
    let y: number;
    if (isVertical) {
      y = lineModel.y2 - lineLabelYOffsetPx;
    } else {
      const fitsAboveLine = lineModel.y - lineLabelYOffsetPx - textHeight > 0;
      y = fitsAboveLine ? lineModel.y - lineLabelYOffsetPx : lineModel.y + lineLabelYOffsetPx;
    }

    return { x, y };
  }
}
