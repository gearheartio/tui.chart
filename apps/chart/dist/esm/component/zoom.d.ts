import Component from "./component";
import { AxisData, ChartState, LabelAxisData, Options, Scale, Series } from "../../types/store/store";
import { RectResponderModel } from "../../types/components/series";
import { ZoomModels } from "../../types/components/zoom";
import { RectResponderInfoForCoordinateType } from "../helpers/responders";
declare type ZoomableSeries = Pick<Series, 'line' | 'area'>;
export default class Zoom extends Component {
    models: ZoomModels;
    responders: RectResponderModel[];
    startIndex: number;
    private dragStartPosition;
    private dragStartPoint;
    private isDragging;
    initialize(): void;
    render(state: ChartState<Options>, computed: any): void;
    getRectResponderInfoForCoordinateType(series: ZoomableSeries, scale: Scale, axisData: LabelAxisData, categories: string[]): RectResponderInfoForCoordinateType[];
    resetSelectionArea(): void;
    onMousedown({ responders, mousePosition }: {
        responders: any;
        mousePosition: any;
    }): void;
    onMouseup({ responders }: {
        responders: RectResponderModel[];
    }): void;
    makeRectResponderModel(categories: string[], axisData: AxisData): RectResponderModel[];
    makeRectResponderModelForCoordinateType(responderInfo: RectResponderInfoForCoordinateType[], categories: string[]): {
        data: {
            name: string;
            value: string;
        };
        type: "rect";
        color?: string | undefined;
        borderColor?: string | undefined;
        style?: import("../../types/components/series").StyleProp<import("../../types/components/series").RectStyle, "shadow"> | undefined;
        thickness?: number | undefined;
        value?: number | import("../../types/options").RangeDataType<number> | null | undefined;
        name?: string | undefined;
        index?: number | undefined;
        x: number;
        y: number;
        width: number;
        height: number;
        label?: string | undefined;
        viewLabel?: string | undefined;
        checked?: boolean | undefined;
        active?: boolean | undefined;
        chartType?: "area" | "line" | "boxPlot" | "bullet" | "pie" | "heatmap" | "scatter" | "bar" | "column" | "bubble" | "radar" | "treemap" | "radialBar" | "gauge" | undefined;
        iconType?: "triangle" | "circle" | "line" | "rect" | "pentagon" | "star" | "diamond" | "cross" | "hexagon" | "spectrum" | undefined;
        useScatterChartIcon?: boolean | undefined;
        rowIndex?: number | undefined;
        columnIndex?: number | undefined;
    }[];
    onMousemove({ responders, mousePosition }: {
        responders: any;
        mousePosition: any;
    }): void;
    onMouseoutComponent(): void;
}
export {};
