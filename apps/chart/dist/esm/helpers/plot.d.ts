import { PlotLine, PlotBand, GaugePlotBand } from "../../types/options";
import { Series } from "../../types/store/store";
export declare function isExistPlotId<T extends PlotLine | PlotBand | GaugePlotBand>(plots: T[], data: T): boolean;
export declare function doesChartSupportPlotElements(series: Series): boolean;
export declare function shouldFlipPlotLines(series: Series): boolean;
