// @flow

import * as RS from 'react-stockcharts';
import React from 'react';
import { WaitSpinner } from './waitSpinner';
import { format } from 'd3-format';
import { path } from '../prelude';
import { timeFormat } from 'd3-time-format';

const {
  ChartCanvas, Chart,
  axes: { XAxis, YAxis },
  coordinates: {
    CrossHairCursor,
    CurrentCoordinate,
    EdgeIndicator,
    MouseCoordinateX,
    MouseCoordinateY,
  },
  scale: { discontinuousTimeScaleProvider },
  series: { LineSeries },
} = RS;

import type { ChartableData, Color } from '../types';

type ChartInnerProps = {
  data: ChartableData,
  colors: {[string]: Color},
  height: number,
  width: number,
  readySymbols: Array<string>,
  symbols: Array<string>,
};

const VALUETOPLOT = 'Close';
const ChartInner = (
  {colors, data, height, width, readySymbols: symbols}: ChartInnerProps
) =>
  <ChartCanvas
      ratio={1}
      width={width}
      height={height}
      margin={{bottom: 30, left: 20, right: 120, top: 20}}
      type="svg"
      data={data}
      seriesName="SPX?"
      xAccessor={x => x.Date}
      xScaleProvider={discontinuousTimeScaleProvider}
    >
    <CrossHairCursor stroke="black"/>
    <Chart
        yExtents={d => symbols.map(s => path([s, VALUETOPLOT], d))}>
      <XAxis axisAt="bottom" orient="bottom"/>
      <YAxis axisAt="right" orient="right" zoomEnabled={false}/>

      {symbols.map(
        s => [
          <LineSeries
            key={`line_${s}`}
            yAccessor={path([s, VALUETOPLOT])}
            stroke={colors[s]}
            highlightOnHover
          />,
          <CurrentCoordinate
            key={`coord_${s}`}
            yAccessor={path([s, VALUETOPLOT])}
            fill={colors[s]}
          />,
          <EdgeIndicator
            key={`edge_${s}`}
            itemType="last"
            orient="right"
            edgeAt="right"
            yAccessor={path([s, VALUETOPLOT])}
            displayFormat={d => `${d} ${s}`}
            rectWidth={100}
            fill={colors[s]}
          />,
        ]
      )}

      <MouseCoordinateX
        at="bottom"
        orient="bottom"
        displayFormat={timeFormat('%Y-%m-%d')}/>
      <MouseCoordinateY
        at="right"
        orient="right"
        displayFormat={format('.2f')}/>
    </Chart>
  </ChartCanvas>;

// eslint-disable-next-line no-magic-numbers
const isNotEmpty = x => x.length > 0;

const EmptyChart = ({symbols}) =>
  <div className="emptyChart">
    { isNotEmpty(symbols)
      ? <WaitSpinner className="emptyChart-spinner"/>
      : <span className="emptyChart-contents">
          Nothing here yet. Add a symbol to get started.
        </span>
    }
  </div>;

const GuardedChart = (props: ChartInnerProps) =>
  isNotEmpty(props.data) && isNotEmpty(props.readySymbols)
  ? <ChartInner {...props}/>
  : <EmptyChart {...props}/>;

export default GuardedChart;
