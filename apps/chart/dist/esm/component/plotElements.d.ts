import { PlotElementsModels } from "../../types/components/plotElements";
import Component from "./component";
import { ChartState, Options, Axes, Scale } from "../../types/store/store";
import { LabelModel, LineModel } from "../../types/components/axis";
import { RectModel } from "../../types/components/series";
import { PlotLine, PlotBand } from "../../types/options";
import { PlotTheme } from "../../types/theme";
export default class PlotElements extends Component {
    models: PlotElementsModels;
    startIndex: number;
    theme: Required<PlotTheme>;
    initialize(): void;
    getPlotAxisSize(vertical: boolean): {
        offsetSize: number;
        anchorSize: number;
    };
    renderLines(axes: Axes, categories: string[], scale: Scale, lines?: PlotLine[], shouldFlip?: boolean): LineModel[];
    renderBands(axes: Axes, categories: string[], scale: Scale, bands?: PlotBand[], shouldFlip?: boolean): RectModel[];
    renderPlotLineModels(relativePositions: number[], vertical: boolean, options?: {
        size?: number;
        startPosition?: number;
        axes?: Axes;
    }): LineModel[];
    renderPlotsForCenterYAxis(axes: Axes): LineModel[];
    renderPlots(axes: Axes, scale?: Scale): LineModel[];
    getVerticalTickPixelPositions(axes: Axes, scale?: Scale): number[];
    getHorizontalTickPixelPositions(axes: Axes): number[];
    renderPlotBackgroundRect(): RectModel;
    render(state: ChartState<Options>): void;
    makeLineModel(vertical: boolean, position: number, { color, dashSegments, name, lineWidth, }: {
        color: string;
        name?: string;
        dashSegments?: number[];
        lineWidth?: number;
    }, sizeWidth?: number, xPos?: number): LineModel;
    makeBandModel(vertical: boolean, start: number, end: number, anchorSize: number, color: string): RectModel;
    renderLabelModels(lineModels: LineModel[]): LabelModel[];
    private getLabelCoords;
}
