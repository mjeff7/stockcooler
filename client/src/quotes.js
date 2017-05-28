// @flow

import * as d3 from 'd3-time-format';
import {
  Future,
  Just,
  Maybe,
  maybe_,
  Nothing,
  sortBy,
  zipObj,
  zipWith
} from './prelude';
import { futurize, sideEffect } from './utils';


export type QuoteDatum = { Date: Date, Close: number };
export type QuoteHistory = Array<QuoteDatum>;

const data_url : string => string = symbol =>
  `/history?q=${symbol}`;

const fetchText = (url: string) =>
  fetch(url)
  .then(response => response.ok
                    ? response
                    : Promise.reject({ error: 'fetch error',
                                       statusText: response.statusText,
                                       response
                                     }))
  .then(r => r.text());
const fetchHistoryFromNetwork : string => Future =
  symbol => futurize(fetchText)(data_url(symbol));


// csvToJSON can throw.
const csvToJSON = (blob : string) => {
  const parseDate = d3.timeParse('%-d-%b-%y');
  const LINE_DELIMITER = '\n',
        ITEM_DELIMITER = ',',
        lines = blob.split(LINE_DELIMITER),
        fields = lines[0].split(ITEM_DELIMITER),
        data = lines
               .slice(1)
               .filter(l => l.length > 0)
               .map(l => l.split(ITEM_DELIMITER))
               .map(zipWith((f, x) => f(x),
                            [parseDate,
                             parseFloat,
                             parseFloat,
                             parseFloat,
                             parseFloat,
                             parseInt]))
               .map(zipObj(fields));

  return data;
};

const historyCache = new Map();
const fetchingTickets = new Map();

const fetchAndCacheHistory = (symbol: string): Future<*, QuoteHistory> =>
  fetchHistoryFromNetwork(symbol)
  .chain(Future.encase(csvToJSON))
  .map(sortBy(x => x.Date))
  .map(sideEffect(data => historyCache.set(symbol, data)))
  .map(sideEffect(() => fetchingTickets.delete(symbol)))
  .chainRej(error => Future.reject({
    description: `Cannot load history for symbol ${symbol}`,
    error,
    symbol
  }));

const listenForSymbolArrival = symbol => {
  if(!fetchingTickets.has(symbol))
    fetchingTickets.set(
      symbol,
      Future.cache(fetchAndCacheHistory(symbol))
    );

  return fetchingTickets.get(symbol);
};


export const getQuoteHistory : string => Future<*, QuoteHistory> = symbol =>
  historyCache.has(symbol)
  ? Future.of(historyCache.get(symbol))
  : listenForSymbolArrival(symbol);
