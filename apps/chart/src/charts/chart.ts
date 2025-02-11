import Store from '@src/store/store';
import root from '@src/store/root';
import layout from '@src/store/layout';
import seriesData from '@src/store/seriesData';
import category from '@src/store/category';
import legend from '@src/store/legend';
import optionsStore from '@src/store/options';
import theme from '@src/store/theme';
import EventEmitter from '@src/eventEmitter';
import ComponentManager from '@src/component/componentManager';
import Painter from '@src/painter';
import Animator from '@src/animator';
import { debounce, isBoolean, isNumber, isUndefined, pick, isAutoValue } from '@src/helpers/utils';
import {
  ChartProps,
  Point,
  AnimationOptions,
  SeriesDataInput,
  Size,
  DataInput,
  ChartSizeInput,
} from '@t/options';

import { RespondersModel } from '@src/component/component';
import { responderDetectors } from '@src/responderDetectors';
import { ChartState, Options, StoreModule, UsingContainerSize } from '@t/store/store';
import Component from '@src/component/component';
import { CheckedLegendType } from '@t/components/legend';
import { message } from '@src/message';
import { sendHostname } from '@src/helpers/googleAnalytics';
import { makeObservableObjectToNormal } from '@src/store/reactive';
import { SelectSeriesInfo, AddSeriesDataInfo } from '@t/charts';
import { CustomEventType, EventListener } from '@t/eventEmitter';
import { isMouseInRect } from '@src/helpers/coordinate';

export const DEFAULT_ANIM_DURATION = 500;

export interface SelectSeriesHandlerParams<T extends Options> extends SelectSeriesInfo {
  state: ChartState<T>;
}

function getUsingContainerSize(
  eventName: 'initOptions' | 'updateOptions',
  usingContainerSize: UsingContainerSize,
  width?: ChartSizeInput,
  height?: ChartSizeInput
) {
  const { width: usingContainerWidth, height: usingContainerHeight } = usingContainerSize;
  const isAutoWidth = isAutoValue(width);
  const isAutoHeight = isAutoValue(height);

  return eventName === 'updateOptions'
    ? {
        width:
          !isUndefined(width) && usingContainerWidth !== isAutoWidth
            ? isAutoWidth
            : usingContainerWidth,
        height:
          !isUndefined(height) && usingContainerHeight !== isAutoHeight
            ? isAutoHeight
            : usingContainerHeight,
      }
    : {
        width: isAutoWidth,
        height: isAutoHeight,
      };
}

/**
 * @class
 * @abstract
 * Abstract class used to implement each chart.
 */
export default abstract class Chart<T extends Options> {
  store: Store<T>;

  ___animId___ = null;

  animator: Animator;

  readonly containerEl: HTMLElement;

  el: HTMLDivElement;

  ctx!: CanvasRenderingContext2D;

  painter = new Painter(this);

  readonly eventBus: EventEmitter = new EventEmitter();

  readonly componentManager: ComponentManager<T>;

  modules: StoreModule[];

  enteredComponents: Component[] = [];

  animationControlFlag = {
    resizing: false,
    updating: false,
  };

  resizeObserver: ResizeObserver | null = null;

  private getAnimationDuration(animationOption?: AnimationOptions) {
    const { firstRendering } = this.animator;
    const { resizing, updating } = this.animationControlFlag;
    let duration;

    if ((!firstRendering && !resizing) || isUndefined(animationOption)) {
      duration = DEFAULT_ANIM_DURATION;
    } else if (isBoolean(animationOption)) {
      duration = animationOption ? DEFAULT_ANIM_DURATION : 0;
    } else if (isNumber(animationOption.duration)) {
      duration = animationOption.duration;
    }

    if (updating) {
      duration = 0;
    }

    this.animationControlFlag.updating = false;

    return duration;
  }

  createChartWrapper() {
    const el = document.createElement('div');
    el.classList.add('toastui-chart-wrapper');

    return el;
  }

  constructor(props: ChartProps<T>) {
    const { el, options, series, categories, modules } = props;
    this.modules = modules ?? [];

    if (isUndefined(options.usageStatistics) || options.usageStatistics) {
      sendHostname();
    }

    this.containerEl = el;
    this.el = this.createChartWrapper();
    this.containerEl.appendChild(this.el);

    this.animator = new Animator();

    this.store = new Store({
      series,
      categories,
      options,
    });

    this.componentManager = new ComponentManager({
      store: this.store,
      eventBus: this.eventBus,
    });

    this.eventBus.on(
      'needLoop',
      debounce(
        () => {
          let duration = this.getAnimationDuration(options.chart?.animation);

          if (this.animationControlFlag.resizing) {
            duration = isUndefined(options.responsive)
              ? this.getAnimationDuration()
              : this.getAnimationDuration(options.responsive?.animation);

            this.animationControlFlag.resizing = false;
          }

          this.eventBus.emit('loopStart');

          this.animator.add({
            onCompleted: () => {
              this.eventBus.emit('loopComplete');
            },
            chart: this,
            duration,
            requester: this,
          });
        },
        10,
        true
      )
    );

    this.eventBus.on('needSubLoop', (opts) => {
      this.animator.add({ ...opts, chart: this });
    });

    this.eventBus.on(
      'needDraw',
      debounce(() => {
        this.draw();
      }, 10)
    );

    this.initialize();
    this.store.observe(() => {
      this.painter.setup();
    });

    if (isAutoValue(options?.chart?.width) || isAutoValue(options?.chart?.height)) {
      this.setResizeEvent();
    }
  }

  resizeChartSize(containerWidth?: number, containerHeight?: number) {
    this.animationControlFlag.resizing = true;
    const {
      usingContainerSize: { width: usingContainerWidth, height: usingContainerHeight },
      chart: { width, height },
    } = this.store.state;

    if (
      !(usingContainerWidth || usingContainerHeight) ||
      !(containerWidth || containerHeight) ||
      (containerWidth === width && containerHeight === height)
    ) {
      this.animationControlFlag.resizing = false;

      return;
    }

    // @TODO: For updates where the data doesn't change, it looks good to recalculate the selected series position.
    this.resetSeries();

    this.store.dispatch('setChartSize', {
      width: usingContainerWidth ? containerWidth : width,
      height: usingContainerHeight ? containerHeight : height,
    });

    this.draw();
  }

  private debounceResizeEvent = debounce(() => {
    const { offsetWidth, offsetHeight } = this.containerEl;
    this.resizeChartSize(offsetWidth, offsetHeight);
  }, 100);

  setResizeEvent() {
    const { usingContainerSize } = this.store.state;

    if (
      (usingContainerSize.height && !this.containerEl.style.height.length) ||
      (usingContainerSize.width && !this.containerEl.style.width.length)
    ) {
      throw new Error(message.AUTO_LAYOUT_CONTAINER_SIZE_ERROR);
    }

    const isResizeObserverAPIExist = typeof ResizeObserver === 'undefined';

    if (isResizeObserverAPIExist) {
      window.addEventListener('resize', this.debounceResizeEvent);
    } else {
      this.resizeObserver = new ResizeObserver((entries) => {
        entries.forEach(() => {
          this.debounceResizeEvent();
        });
      });
      this.resizeObserver.observe(this.containerEl);
    }
  }

  clearResizeEvent() {
    if (this.resizeObserver) {
      this.resizeObserver.unobserve(this.containerEl);
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    } else {
      window.removeEventListener('resize', this.debounceResizeEvent);
    }
  }

  handleCanvasMouseEvent(eventType: string, mousePosition: Point) {
    const newEnteredComponents: Component[] = [];
    this.componentManager.forEach((component) => {
      if (eventType === 'mousemove') {
        const exist = this.enteredComponents.some(
          (enteredComponent) => enteredComponent === component
        );
        if (isMouseInRect(component.rect, mousePosition)) {
          newEnteredComponents.push(component);

          if (!exist && component.onMouseenterComponent) {
            component.onMouseenterComponent();
          }
        } else if (exist && component.onMouseoutComponent) {
          component.onMouseoutComponent();
        }
      } else if (eventType === 'mouseout' && component.onMouseoutComponent) {
        component.onMouseoutComponent();
      }
    });

    this.enteredComponents = newEnteredComponents;
  }

  handleResponderEvent(event: MouseEvent, mousePosition: Point) {
    const eventType = event.type;
    const delegationMethod = `on${eventType[0].toUpperCase() + eventType.substring(1)}`;

    const allResponders: RespondersModel = [];
    this.componentManager.forEach((component) => {
      if (!component[delegationMethod]) {
        return;
      }

      if (!responderDetectors.rect(mousePosition, component.rect)) {
        return;
      }

      const detected = (component.responders || []).filter((m) => {
        return responderDetectors[m.type](mousePosition, m, component.rect);
      });

      if (detected.length) {
        allResponders.push({ component, detected });
      }

      component[delegationMethod]({ mousePosition, responders: detected }, event);
    });

    if (this.handleEventForAllResponders) {
      this.handleEventForAllResponders(event, allResponders, delegationMethod, mousePosition);
    }
  }

  handleEvent(event: MouseEvent) {
    const { clientX, clientY, type: eventType } = event;

    const canvas = this.painter.ctx.canvas;
    const { width, height, left, top } = canvas.getBoundingClientRect();
    // Calculate scale for chart affected by a CSS transform.
    const scaleX = width / canvas.offsetWidth;
    const scaleY = height / canvas.offsetHeight;

    const mousePosition = {
      x: (clientX - left) / scaleX,
      y: (clientY - top) / scaleY,
    };

    if (eventType === 'mousemove' || eventType === 'mouseout') {
      this.handleCanvasMouseEvent(eventType, mousePosition);
    }

    this.handleResponderEvent(event, mousePosition);
  }

  protected initStore() {
    [
      root,
      optionsStore,
      theme,
      seriesData,
      legend,
      layout,
      category,
      ...this.modules,
    ].forEach((module) => this.store.setModule(module));
  }

  protected initialize() {
    this.initStore();
    this.store.dispatch('initChartSize', this.containerEl);
  }

  draw() {
    this.painter.beforeFrame();

    this.componentManager.forEach((component) => {
      if (!component.isShow) {
        return;
      }

      this.painter.beforeDraw(component.rect.x, component.rect.y);
      if (component.beforeDraw) {
        component.beforeDraw(this.painter);
      }

      component.draw(this.painter);
      this.painter.afterDraw();
    });
  }

  update(delta: number) {
    this.componentManager.invoke('update', delta);
  }

  initUpdate(delta: number) {
    this.componentManager.invoke('initUpdate', delta);
  }

  protected handleEventForAllResponders?(
    event: MouseEvent,
    responderModels: RespondersModel,
    delegationMethod: string,
    mousePosition: Point
  ): void;

  /**
   * Get checked legend chart type and label, checked state.
   * @returns {Array<{checked: boolean, chartType: string, label: string}>} Array data that whether series has checked
   * @api
   * @example
   * const checkedLegend = chart.getCheckedLegend()
   */
  public getCheckedLegend = (): CheckedLegendType => {
    const { data } = this.store.state.legend;

    return data
      .filter((datum) => datum.checked)
      .map((datum) => pick(datum, 'chartType', 'label', 'checked'));
  };

  public abstract updateOptions(options: Options): void;

  public abstract setOptions(options: Options): void;

  public abstract showTooltip(info: SelectSeriesInfo): void;

  public abstract hideTooltip(): void;

  /**
   * Returns the currently applied chart options.
   * @returns {Object} options
   * @api
   * @example
   * const options = chart.getOptions();
   */
  public getOptions = () => {
    return makeObservableObjectToNormal(this.store.initStoreState.options);
  };

  public abstract addSeries(data: SeriesDataInput, dataInfo?: AddSeriesDataInfo): void;

  /**
   * Register of user custom event.
   * @param {string} eventName - Event name. 'clickLegendLabel', 'clickLegendCheckbox', 'selectSeries', 'unselectSeries', 'hoverSeries', 'unhoverSeries', 'zoom', 'resetZoom' is available.
   * @param {Function} handler - Event handler
   * @api
   */
  public on = (eventName: CustomEventType, handler: EventListener) => {
    /**
     * Register Events that occur when click legend label
     * @event ChartBase#clickLegendLabel
     * @param {object} info selected legend information
     * @api
     * @example
     * chart.on('clickLegendLabel', (info) => {
     *   console.log(info);
     * });
     */

    /**
     * Register Events that occur when click legend checkbox
     * @event ChartBase#clickLegendCheckbox
     * @param {object} info selected legend info
     * @api
     * @example
     * chart.on('clickLegendCheckbox', (info) => {
     *   console.log(info);
     * });
     */

    /**
     * Register Events that occur when select series
     * @event ChartBase#selectSeries
     * @param {object} info selected series info
     * @api
     * @example
     * chart.on('selectSeries', (info) => {
     *   console.log(info);
     * });
     */

    /**
     * Register Events that occur when unselect series
     * @event ChartBase#unselectSeries
     * @param {object} info unselected series info
     * @api
     * @example
     * chart.on('unselectSeries', (info) => {
     *   console.log(info);
     * });
     */

    /**
     * Register Events that occur when hover to series
     * @event ChartBase#hoverSeries
     * @param {object} info hovered series info
     * @api
     * @example
     * chart.on('hoverSeries', (info) => {
     *   console.log(info);
     * });
     */

    /**
     * Register Events that occur when unhover from series
     * @event ChartBase#unhoverSeries
     * @param {object} info unhovered series info
     * @api
     * @example
     * chart.on('unhoverSeries', (info) => {
     *  console.log(info);
     * });
     */

    /**
     * Register Events that occur when zooming
     * @event ChartBase#zoom
     * @param {string[]} dataRange - []
     * @api
     * @example
     * chart.on('zoom', (dataRange) => {
     *    console.log(dataRange);
     * });
     */

    /**
     * Register Events that occur when zoom is reset
     * @event ChartBase#resetZoom
     * @api
     * @example
     * chart.on('resetZoom', () => {});
     */
    this.eventBus.on(eventName, handler);
  };

  /**
   * Unregister of all user custom events.
   * @param {string} eventName - Event name. 'clickLegendLabel', 'clickLegendCheckbox', 'selectSeries', 'unselectSeries', 'hoverSeries', 'unhoverSeries', 'zoom', 'resetZoom' is available.
   */
  public off(eventName: CustomEventType): void {
    this.eventBus.off(eventName);
  }

  public abstract setData(data: DataInput): void;

  /**
   * Destroys the instance.
   * @api
   * @example
   * chart.destroy();
   */
  public destroy = () => {
    this.componentManager.clear();
    this.clearResizeEvent();
    this.containerEl.innerHTML = '';
  };

  private isSelectableSeries() {
    return this.store.initStoreState.options.series?.selectable;
  }

  /**
   * Select series. It works only when the selectable option is true.
   * @param {Object} seriesInfo - Information of the series to be selected
   *      @param {number} [seriesInfo.seriesIndex] - Index of series
   *      @param {number} [seriesInfo.index] - Index of data within series
   *      @param {string} [seriesInfo.name] - Specify name for NestedPie Chart
   *      @param {string} [seriesInfo.chartType] - Specify which chart to select when using LineArea, LineScatter, and ColumnLine charts.specifies which chart to select when using LineArea, LineScatter, and ColumnLine charts.
   * @api
   * @example
   * chart.selectSeries({index: 1, seriesIndex: 2});
   */
  public selectSeries = (seriesInfo: SelectSeriesInfo) => {
    if (!this.isSelectableSeries()) {
      throw new Error(message.SELECT_SERIES_API_SELECTABLE_ERROR);
    }

    this.eventBus.emit('selectSeries', { ...seriesInfo, state: this.store.state });
  };

  /**
   * Unselect selected series. It works only when the selectable option is true.
   * @api
   * @example
   * chart.unselectSeries();
   */
  public unselectSeries = () => {
    if (!this.isSelectableSeries()) {
      throw new Error(message.SELECT_SERIES_API_SELECTABLE_ERROR);
    }

    this.store.dispatch('setAllLegendActiveState', true);
    this.eventBus.emit('resetSelectedSeries');
  };

  /**
   * Resize chart size.
   * @param {Object} size Chart size
   *   @param {number} [size.width] Width
   *   @param {number} [size.height] Height
   * @api
   * @example
   * chart.resize({height: 100, width: 200});
   */
  public resize = (size: Partial<Size>) => {
    this.resetSeries();
    this.dispatchOptionsEvent('updateOptions', { chart: { ...size } });
  };

  /**
   * Set tooltip offset.
   * @param {Object} offset - Offset size
   *   @param {number} [offset.x] Offset value to move title horizontally
   *   @param {number} [offset.y] Offset value to move title vertically
   * @api
   * @example
   * chart.setTooltipOffset({x: 10, y: -20});
   */
  public setTooltipOffset(offset: Partial<Point>) {
    const { x: offsetX, y: offsetY } = offset;

    this.store.dispatch('updateOptions', { options: { tooltip: { offsetX, offsetY } } });
  }

  resetSeries = () => {
    this.eventBus.emit('resetHoveredSeries');
    this.eventBus.emit('resetSelectedSeries');
  };

  private setResizeEventListeners = (
    eventName: 'initOptions' | 'updateOptions',
    options: Options
  ) => {
    const { usingContainerSize } = this.store.state;
    const { width: usingContainerWidth, height: usingContainerHeight } = usingContainerSize;
    const width = options?.chart?.width;
    const height = options?.chart?.height;
    const isAutoWidth = isAutoValue(width);
    const isAutoHeight = isAutoValue(height);

    this.store.dispatch(
      'setUsingContainerSize',
      getUsingContainerSize(eventName, usingContainerSize, width, height)
    );

    if ((usingContainerWidth || usingContainerHeight) && isNumber(width) && isNumber(height)) {
      this.clearResizeEvent();
    } else if (!(usingContainerWidth || usingContainerHeight) && (isAutoWidth || isAutoHeight)) {
      this.setResizeEvent();
    }
  };

  protected dispatchOptionsEvent(eventName: 'initOptions' | 'updateOptions', options: Options) {
    this.setResizeEventListeners(eventName, options);

    const { offsetWidth, offsetHeight } = this.containerEl;

    this.store.dispatch(eventName, {
      options,
      containerSize: { width: offsetWidth, height: offsetHeight },
    });
  }
}
