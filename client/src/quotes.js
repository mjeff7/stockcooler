// @flow

// eslint-disable-next-line
import fetch from 'node-fetch';
import * as d3 from 'd3-time-format';
import {
  Future,
  Just,
  Maybe,
  maybe,
  Nothing,
  prop,
  sortBy,
  zipObj,
  zipWith
} from './prelude';
import { fileCache, localStorageCache } from './cache';
// eslint-disable-next-line
import { futurize, sideEffect } from './utils';


export type QuoteDatum = { Date: Date, Close: number };
export type QuoteHistory = Array<QuoteDatum>;

const data_url : string => string = symbol =>
  `http://localhost:3000/history?q=${symbol}`;

const fetchText = url =>
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

import fs from 'fs';
const MOCK_DIR = 'mock/cache';
let historyCache;
try {
  // eslint-disable-next-line
  localStorage; // This line will fail on node.
  console.log("Browser");
  historyCache = localStorageCache(MOCK_DIR);
} catch(e) {
  try { fs.mkdirSync(MOCK_DIR); }
  catch(e) { if(e.code !== 'EEXIST') throw e; };
  historyCache = fileCache(MOCK_DIR);
}
historyCache = new Map();

export const getQuoteHistoryNow : string => Maybe = symbol =>
  historyCache.has(symbol) ? Just(historyCache.get(symbol))
                           : Nothing;


// csvToJSON can throw.
const csvToJSON = (blob : string) => {
  const parseDate = d3.timeParse('%-d-%b-%y');
  const LINE_DELIMITER = '\n',
        ITEM_DELIMITER = ',',
        lines = blob.slice(1).split(LINE_DELIMITER),
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

export const getQuoteHistory : string => Future<*, QuoteHistory> = symbol =>
  maybe(
    fetchHistoryFromNetwork(symbol)
    .map(csvToJSON)
    .map(sortBy(x => x.Date))
    .map(sideEffect(data => historyCache.set(symbol, data)))
    .chainRej(error => Future.reject({
      description: `Cannot load history for symbol ${symbol}`,
      error,
      symbol
    })),

    Future.of,
    getQuoteHistoryNow(symbol)
  );
