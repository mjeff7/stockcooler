// @flow

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileCache } from './cache';


const data_url : string => string = symbol =>
  'http://www.google.com/finance/historical' +
  `?q=${symbol}&startdate=1970-01-01&output=csv`;

const fetchText = symbol =>
  fetch(data_url(symbol))
  .then(response => response.ok
                    ? response
                    : Promise.reject({ error: 'fetch error',
                                       statusText: response.statusText,
                                       response
                                     }))
  .then(r => r.text());


const mkdirP = pathIn => {
  const {root, dir, base} = path.parse(pathIn);
  if(root !== dir)
    mkdirP(dir);

  try { fs.mkdirSync(pathIn); }
  catch(e) { if(e.code !== 'EEXIST') throw e; };
};

const MOCK_DIR = 'mock/cache';
mkdirP(MOCK_DIR);
let historyCache = fileCache(MOCK_DIR);


const sideEffect = f => x => {
  f(x);
  return x;
};

const getHistory = symbol =>
  historyCache.has(symbol)
  ? Promise.resolve(historyCache.get(symbol))
  : fetchText(symbol)
    .then(sideEffect(d => historyCache.set(symbol, d)))
    .catch(error => {
      console.error({error});
      return Promise.reject(error);
    });


module.exports = (req: {query: {q: string}},
                  res: {end: * => void}) =>
  getHistory(req.query.q)
  .catch(error => {
    res.status(error.response.status);
    return JSON.stringify(error);
  })
  .then(sideEffect(() => res.set('Content-Type', 'text/csv')))
  .then(x => res.end(x));
