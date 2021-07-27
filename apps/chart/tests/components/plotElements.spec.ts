import PlotElements from '@src/component/plotElements';
import EventEmitter from '@src/eventEmitter';
import { deepMergedCopy } from '@src/helpers/utils';
import Store from '@src/store/store';
import { Options } from '@t/store/store';

let plotElementsSpec;

describe('plot elements options', () => {
  const data = [];
  const state = {
    chart: { width: 100, height: 100 },
    layout: {
      xAxis: { x: 10, y: 80, width: 80, height: 10 },
      yAxis: { x: 10, y: 10, width: 10, height: 80 },
      plot: { width: 80, height: 80, x: 10, y: 10 },
    },
    scale: {},
    series: {
      line: {
        data: data,
        seriesCount: 0,
        seriesGroupCount: 0,
      },
    },
    axes: {
      xAxis: {
        labels: ['0', '1', '2', '3', '4', '5'],
        tickCount: 6,
        tickDistance: 16,
        labelDistance: 16,
      },
      yAxis: {
        labels: ['0', '1', '2', '3', '4', '5'],
        tickCount: 6,
        tickDistance: 16,
        labelDistance: 16,
      },
    },
    plot: {},
    options: {
      series: {},
    },
    legend: {
      data: [
        { label: 'han', active: true, checked: true },
        { label: 'cho', active: true, checked: true },
      ],
    },
    categories: ['0', '1', '2', '3', '4', '5'],
    theme: {
      plot: {
        lineColor: 'rgba(0, 0, 0, 0.05)',
        vertical: {
          lineColor: 'rgba(0, 0, 0, 0.05)',
        },
        horizontal: {
          lineColor: 'rgba(0, 0, 0, 0.05)',
        },
        backgroundColor: '#ffffff',
      },
    },
  };

  beforeEach(() => {
    plotElementsSpec = new PlotElements({
      store: {} as Store<Options>,
      eventBus: new EventEmitter(),
    });
  });

  it('should not render plot object itself', () => {
    plotElementsSpec.render(state);

    expect(plotElementsSpec.models.plot).not.toBeDefined();
  });

  it('should render rect models for bands', () => {
    plotElementsSpec.render(
      deepMergedCopy(state, {
        plot: {
          bands: [
            {
              range: [1, 2],
              color: 'rgba(33, 33, 33, 0.2)',
            },
          ],
        },
        options: {
          plot: {
            bands: [
              {
                range: [1, 2],
                color: 'rgba(33, 33, 33, 0.2)',
              },
            ],
          },
        },
      })
    );

    expect(plotElementsSpec.models.band).toEqual([
      {
        type: 'rect',
        color: 'rgba(33, 33, 33, 0.2)',
        height: 80,
        width: 16,
        x: 16.5,
        y: 0.5,
      },
    ]);
  });

  it('should render line models for lines', () => {
    plotElementsSpec.render(
      deepMergedCopy(state, {
        plot: {
          lines: [
            {
              value: 4,
              color: '#ff0000',
              vertical: true,
            },
          ],
        },
        options: {
          plot: {
            lines: [
              {
                value: 4,
                color: '#ff0000',
              },
            ],
          },
        },
      })
    );

    expect(plotElementsSpec.models.line).toEqual([
      {
        type: 'line',
        x: 64.5,
        y: 0.5,
        x2: 64.5,
        y2: 80.5,
        strokeStyle: '#ff0000',
        dashSegments: [],
        lineWidth: 1,
      },
    ]);
  });
});
