// @flow

import React from 'react';
import * as RS from 'react-stockcharts';
import { format } from 'd3-format';
import { timeFormat } from 'd3-time-format';
import { WaitSpinner } from './waitSpinner';
import { path } from '../prelude';

const { ChartCanvas, Chart,
        axes: { XAxis, YAxis },
        coordinates: { CrossHairCursor,
                       CurrentCoordinate,
                       EdgeIndicator,
                       MouseCoordinateX,
                       MouseCoordinateY
                     },
        scale: { discontinuousTimeScaleProvider },
        series: { LineSeries }
      } = RS;

import type { ChartableData, Color } from '../types';

const VALUETOPLOT = 'Close';
const ChartInner = (
  {colors, data, height, width, readySymbols: symbols}: {
    data: ChartableData,
    colors: {[string]: Color},
    height: number,
    width: number,
    readySymbols: Array<string>,
    symbols: Array<string>,
  }
) => <ChartCanvas
      ratio={1}
      width={width}
      height={height}
      margin={{left: 20, right: 120, top: 20, bottom: 30}}
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
        s => [ <LineSeries key={'line_' + s}
                           yAccessor={path([s, VALUETOPLOT])}
                           stroke={colors[s]}
                           highlightOnHover/>,
               <CurrentCoordinate
                           key={'coord_' + s}
                           yAccessor={path([s, VALUETOPLOT])}
                           fill={colors[s]}/>,
               <EdgeIndicator
                           key={'edge_' + s}
                           itemType='last'
                           orient='right'
                           edgeAt='right'
                           yAccessor={path([s, VALUETOPLOT])}
                           displayFormat={d => `${d} ${s}`}
                           rectWidth={100}
                           fill={colors[s]}/>,
             ]
      )}

      <MouseCoordinateX
        at="bottom"
        orient="bottom"
        displayFormat={timeFormat("%Y-%m-%d")}/>
      <MouseCoordinateY
        at="right"
        orient="right"
        displayFormat={format(".2f")}/>
    </Chart>
  </ChartCanvas>;

const EmptyChart = ({symbols}) =>
  <div className="emptyChart">
    { symbols.length > 0
      ? <WaitSpinner className="emptyChart-spinner"/>
      : <span className="emptyChart-contents">
          Nothing here yet. Add a symbol to get started.
        </span>
    }
  </div>;

const GuardedChart =
  (props: {data: ChartableData,
           colors: {[string]: Color},
           height: number,
           width: number,
           readySymbols: Array<string>,
           symbols: Array<string>}) =>
    props.data.length > 0 && props.readySymbols.length > 0
    ? <ChartInner {...props}/>
    : <EmptyChart {...props}/>;

export default GuardedChart;
