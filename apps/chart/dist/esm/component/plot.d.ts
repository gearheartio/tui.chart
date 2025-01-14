import Component from "./component";
import { ChartState, Options, Axes, Scale } from "../../types/store/store";
import Painter from "../painter";
import { LineModel } from "../../types/components/axis";
import { PlotModels } from "../../types/components/plot";
import { RectModel } from "../../types/components/series";
import { PlotTheme } from "../../types/theme";
export default class Plot extends Component {
    models: PlotModels;
    startIndex: number;
    theme: Required<PlotTheme>;
    initialize(): void;
    getPlotAxisSize(vertical: boolean): {
        offsetSize: number;
        anchorSize: number;
    };
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
    makeLineModel(vertical: boolean, position: number, { color, dashSegments, lineWidth, }: {
        color: string;
        dashSegments?: number[];
        lineWidth?: number;
    }, sizeWidth?: number, xPos?: number): LineModel;
    makeBandModel(vertical: boolean, start: number, end: number, anchorSize: number, color: string): RectModel;
    beforeDraw(painter: Painter): void;
}
