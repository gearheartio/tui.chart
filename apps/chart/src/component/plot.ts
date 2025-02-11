import Component from './component';
import { ChartState, Options, Axes, LabelAxisData, Scale } from '@t/store/store';
import { crispPixel, makeTickPixelPositions } from '@src/helpers/calculator';
import Painter from '@src/painter';
import { LineModel } from '@t/components/axis';
import { PlotModels } from '@t/components/plot';
import { RectModel } from '@t/components/series';
import { PlotTheme, LineTheme } from '@t/theme';
import { pick } from '@src/helpers/utils';

function getPlotAxisData(vertical: boolean, axes: Axes) {
  return vertical ? axes.xAxis : axes.yAxis;
}
export default class Plot extends Component {
  models: PlotModels = { plot: [] };

  startIndex = 0;

  theme!: Required<PlotTheme>;

  initialize() {
    this.type = 'plot';
  }

  getPlotAxisSize(vertical: boolean) {
    return {
      offsetSize: vertical ? this.rect.width : this.rect.height,
      anchorSize: vertical ? this.rect.height : this.rect.width,
    };
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
    const { layout, axes, plot, zoomRange, theme, scale } = state;

    if (!plot) {
      return;
    }

    this.rect = layout.plot;
    this.startIndex = zoomRange?.[0] ?? 0;
    this.theme = theme.plot! as Required<PlotTheme>;

    const { visible } = plot;

    if (visible) {
      this.models.plot = [this.renderPlotBackgroundRect(), ...this.renderPlots(axes, scale)];
    }
  }

  makeLineModel(
    vertical: boolean,
    position: number,
    {
      color,
      dashSegments = [],
      lineWidth = 1,
    }: { color: string; dashSegments?: number[]; lineWidth?: number },
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

  beforeDraw(painter: Painter) {
    painter.ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    painter.ctx.lineWidth = 1;
  }
}
