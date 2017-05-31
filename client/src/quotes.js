// @flow

import * as d3 from 'd3-time-format';
import {
  Future,
  sortBy,
  zipObj,
  zipWith,
} from './prelude';
import { futurize, sideEffect } from './utils';


export type QuoteDatum = { Date: Date, Close: number };
export type QuoteHistory = Array<QuoteDatum>;

const dataURL = (symbol: string) => `history?q=${symbol}`;

const fetchText = (url: string) =>
  fetch(url)
  .then(response =>
    response.ok
    ? response
    : Promise.reject(
      new Error({
        error: 'fetch error',
        response,
        statusText: response.statusText,
      })
    )
  )
  .then(r => r.text());

const fetchHistoryFromNetwork = (symbol: string) =>
  futurize(fetchText)(dataURL(symbol));

// eslint-disable-next-line no-magic-numbers
const isNotEmpty = x => x.length > 0;

// Function csvToJSON can throw.
const csvToJSON = (blob : string) => {
  const parseDate = d3.timeParse('%-d-%b-%y');
  const LINE_DELIMITER = '\n';
  const ITEM_DELIMITER = ',';
  const lines = blob.split(LINE_DELIMITER);
  const [headerLine, ...dataLines] = lines;
  const fields = headerLine.split(ITEM_DELIMITER);
  const data =
    dataLines
    .filter(isNotEmpty)
    .map(l => l.split(ITEM_DELIMITER))
    .map(zipWith(
      (f, x) => f(x),
      [
        parseDate,
        parseFloat,
        parseFloat,
        parseFloat,
        parseFloat,
        parseInt,
      ]
    ))
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
    symbol,
  }));

const listenForSymbolArrival = symbol => {
  if(!fetchingTickets.has(symbol)) {
    fetchingTickets.set(
      symbol,
      Future.cache(fetchAndCacheHistory(symbol))
    );
  }

  return fetchingTickets.get(symbol);
};


// Function getQuoteHistory uses two levels of cache. historyCache stores
// the serializable result and so could potentially persist to disk or
// localStorage while fetchingTickets (via listenForSymbolArrival) is always
// in memory since it stores non-serializable Futures.
export const getQuoteHistory = (symbol: string) =>
  historyCache.has(symbol)
  ? Future.of(historyCache.get(symbol))
  : listenForSymbolArrival(symbol);
