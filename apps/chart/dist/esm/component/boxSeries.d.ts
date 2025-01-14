import Component from "./component";
import { RectModel, ClipRectAreaModel, BoxSeriesModels, StackTotalModel, RectResponderModel, MouseEventType } from "../../types/components/series";
import { ChartState, BoxType, ValueAxisData, CenterYAxisData, Series, Axes, Scale } from "../../types/store/store";
import { BoxSeriesType, BoxSeriesDataType, BarChartOptions, ColumnChartOptions, Rect, RangeDataType, BoxTypeEventDetectType, ColumnLineChartOptions, ColumnLineChartSeriesOptions, BoxSeriesOptions } from "../../types/options";
import { TooltipData } from "../../types/components/tooltip";
import { RespondersThemeType } from "../helpers/responders";
import { RectDirection, RectDataLabel } from "../../types/components/dataLabels";
import { BoxChartSeriesTheme } from "../../types/theme";
import { SelectSeriesHandlerParams } from "../charts/chart";
import { SelectSeriesInfo } from "../../types/charts";
export declare enum SeriesDirection {
    POSITIVE = 0,
    NEGATIVE = 1,
    BOTH = 2
}
declare type RenderOptions = {
    tickDistance: number;
    min: number;
    max: number;
    diverging: boolean;
    ratio?: number;
    hasNegativeValue: boolean;
    seriesDirection: SeriesDirection;
    defaultPadding: number;
};
export declare function isLeftBottomSide(seriesIndex: number): boolean;
export default class BoxSeries extends Component {
    models: BoxSeriesModels;
    drawModels: BoxSeriesModels;
    responders: RectResponderModel[];
    activatedResponders: RectResponderModel[];
    isBar: boolean;
    valueAxis: string;
    labelAxis: string;
    anchorSizeKey: string;
    offsetSizeKey: string;
    basePosition: number;
    leftBasePosition: number;
    rightBasePosition: number;
    isRangeData: boolean;
    offsetKey: string;
    eventDetectType: BoxTypeEventDetectType;
    tooltipRectMap: RectResponderModel[][];
    theme: Required<BoxChartSeriesTheme>;
    initialize({ name, stackChart }: {
        name: BoxType;
        stackChart: boolean;
    }): void;
    initializeFields(name: BoxType): void;
    initUpdate(delta: number): void;
    initUpdateRangeData(delta: number): void;
    initUpdateClipRect(delta: number): void;
    initUpdateConnector(delta: number): void;
    protected setEventDetectType(series: Series, options?: BarChartOptions | ColumnChartOptions): void;
    protected getOptions(chartOptions: BarChartOptions | ColumnChartOptions | ColumnLineChartOptions): {
        series?: BoxSeriesOptions | undefined;
        yAxis?: import("../../types/options").BarTypeYAxisOption | import("../../types/options").BarTypeYAxisOption[] | undefined;
        plot?: import("../../types/options").LineTypePlotOptions | undefined;
        legend?: import("../../types/options").NormalLegendOptions | undefined;
        theme?: import("../../types/theme").BoxChartThemeOptions | undefined;
        chart?: import("../../types/options").BaseChartOptions | undefined;
        lang?: import("../../types/options").LangOptions | undefined;
        xAxis?: import("../../types/options").BaseXAxisOptions | undefined;
        exportMenu?: import("../../types/options").ExportMenuOptions | undefined;
        tooltip?: import("../../types/options").BaseTooltipOptions | undefined;
        responsive?: import("../../types/options").ResponsiveOptions | undefined;
        usageStatistics?: boolean | undefined;
    } | {
        series?: (BoxSeriesOptions & {
            shift?: boolean | undefined;
        }) | undefined;
        yAxis?: import("../../types/options").YAxisOptions | import("../../types/options").YAxisOptions[] | undefined;
        plot?: import("../../types/options").LineTypePlotOptions | undefined;
        legend?: import("../../types/options").NormalLegendOptions | undefined;
        theme?: import("../../types/theme").BoxChartThemeOptions | undefined;
        chart?: import("../../types/options").BaseChartOptions | undefined;
        lang?: import("../../types/options").LangOptions | undefined;
        xAxis?: import("../../types/options").BaseXAxisOptions | undefined;
        exportMenu?: import("../../types/options").ExportMenuOptions | undefined;
        tooltip?: import("../../types/options").BaseTooltipOptions | undefined;
        responsive?: import("../../types/options").ResponsiveOptions | undefined;
        usageStatistics?: boolean | undefined;
    } | {
        series?: ColumnLineChartSeriesOptions | undefined;
        plot?: import("../../types/options").LineTypePlotOptions | undefined;
        yAxis?: import("../../types/options").YAxisOptions | import("../../types/options").YAxisOptions[] | undefined;
        legend?: import("../../types/options").NormalLegendOptions | undefined;
        theme?: import("../../types/theme").ColumnLineChartThemeOptions | undefined;
        chart?: import("../../types/options").BaseChartOptions | undefined;
        lang?: import("../../types/options").LangOptions | undefined;
        xAxis?: import("../../types/options").BaseXAxisOptions | undefined;
        exportMenu?: import("../../types/options").ExportMenuOptions | undefined;
        tooltip?: import("../../types/options").BaseTooltipOptions | undefined;
        responsive?: import("../../types/options").ResponsiveOptions | undefined;
        usageStatistics?: boolean | undefined;
    };
    render<T extends BarChartOptions | ColumnChartOptions | ColumnLineChartOptions>(chartState: ChartState<T>, computed: any): void;
    protected getScaleData(scale: Scale): any;
    protected getBoxSeriesResponders(seriesModels: RectModel[], tooltipData: TooltipData[], axes: Axes, categories: string[]): RectResponderModel[] | {
        data: TooltipData;
        type: "rect";
        color: string;
        borderColor?: string | undefined;
        style?: import("../../types/components/series").StyleProp<import("../../types/components/series").RectStyle, "shadow"> | undefined;
        thickness?: number | undefined;
        value?: number | RangeDataType<number> | null | undefined;
        name?: string | undefined;
        index?: number | undefined;
        x: number;
        y: number;
        width: number;
        height: number;
    }[];
    protected makeTooltipRectMap(seriesModels: RectModel[], tooltipDataArr: TooltipData[]): RectResponderModel[][];
    protected renderClipRectAreaModel(): ClipRectAreaModel;
    protected initClipRect(clipRect: ClipRectAreaModel): ClipRectAreaModel;
    renderSeriesModel(seriesData: BoxSeriesType<number | (RangeDataType<number> & number)>[], renderOptions: RenderOptions): RectModel[];
    protected renderHoveredSeriesModel(seriesModel: RectModel[]): RectModel[];
    makeHoveredSeriesModel(data: RectModel): RectModel;
    getRectModelsFromRectResponders(responders: RectResponderModel[]): RectResponderModel[];
    protected getGroupedRect(responders: RectResponderModel[], type: 'hover' | 'select'): {
        color: string;
        type: "rect";
        borderColor?: string | undefined;
        style?: import("../../types/components/series").StyleProp<import("../../types/components/series").RectStyle, "shadow"> | undefined;
        thickness?: number | undefined;
        value?: number | RangeDataType<number> | null | undefined;
        name?: string | undefined;
        index?: number | undefined;
        x: number;
        y: number;
        width: number;
        height: number;
        data?: ({
            name?: string | undefined;
        } & Partial<TooltipData>) | undefined;
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
    onMousemoveGroupedType(responders: RectResponderModel[]): void;
    onMousemove({ responders }: {
        responders: RectModel[];
    }): void;
    private makeTooltipData;
    private getTooltipValue;
    protected getBasePosition({ labels, tickCount, zeroPosition }: ValueAxisData): number;
    getDivergingBasePosition(centerYAxis: CenterYAxisData): number[];
    protected getOffsetSize(): number;
    getValueRatio(min: number, max: number, size: number): number;
    makeBarLength(value: BoxSeriesDataType, renderOptions: Pick<RenderOptions, 'min' | 'max' | 'ratio'>): number | null;
    protected getBarLength(value: number, ratio: number): number;
    getStartPositionWithRangeValue(value: RangeDataType<number>, barLength: number, renderOptions: RenderOptions): number;
    getStartPosition(barLength: number, value: Exclude<BoxSeriesDataType, null>, renderOptions: RenderOptions, isLBSideWithDiverging: boolean): number;
    private getStartPosOnRightTopSide;
    private getStartPosOnLeftBottomSide;
    protected getAdjustedRect(seriesPosition: number, dataPosition: number, barLength: number, columnWidth: number): Rect;
    getColumnWidth(renderOptions: RenderOptions, seriesLength: number, validDiverging?: boolean): number;
    protected getSeriesDirection(labels: string[]): SeriesDirection;
    protected getTickPositionIfNotZero(tickPositions: number[], direction: SeriesDirection): number;
    makeDataLabel(rect: RectModel, centerYAxis?: CenterYAxisData): RectDataLabel;
    makeDataLabelRangeData(rect: RectModel): RectDataLabel[];
    getDataLabelRangeDataDirection(isEven: boolean): import("../../types/components/axis").ArrowDirection;
    getDataLabelDirection(rect: RectModel | StackTotalModel, centerYAxis?: CenterYAxisData): RectDirection;
    getOffsetSizeWithDiverging(centerYAxis: CenterYAxisData): number;
    onClick({ responders }: MouseEventType): void;
    onMouseoutComponent: () => void;
    getRespondersWithTheme(responders: RectResponderModel[], type: RespondersThemeType): {
        color: string | undefined;
        thickness: number | undefined;
        borderColor: string | undefined;
        style: {
            shadowBlur: number | undefined;
            shadowColor: string | undefined;
            shadowOffsetX: number | undefined;
            shadowOffsetY: number | undefined;
        }[];
        type: "rect";
        value?: number | RangeDataType<number> | null | undefined;
        name?: string | undefined;
        index?: number | undefined;
        x: number;
        y: number;
        width: number;
        height: number;
        data?: ({
            name?: string | undefined;
        } & Partial<TooltipData>) | undefined;
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
    getSeriesColor(name: string, color: string): string;
    selectSeries: (info: SelectSeriesHandlerParams<BarChartOptions | ColumnChartOptions>) => void;
    showTooltip: (info: SelectSeriesInfo) => void;
}
export {};
