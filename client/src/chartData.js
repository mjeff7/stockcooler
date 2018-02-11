import { difference,
       } from './prelude';
import { futureFold } from './utils';
import { getQuoteHistory } from './quotes';


const sortByDates = (a, b) => a.Date - b.Date;


export const newDataManager = () => {
  // Example data:
  // [ { Date: Date(Jan ...), AAPL: { Close: 12, Open: 10, ...},
  //                          GOOG: { Close: 15, Open: 10, ...}, ... },
  //   { Date: Date(Feb ...), AAPL: { Close: 23, Open: 10, ...},
  //                          GOOG: { Close: 33, Open: 10, ...}, ... },
  //   ...
  // ]
  const data = [];
  // Example dataIndex:
  // { Date(Jan ...): { Date: Date(Jan ...), AAPL: ... (an object in data) },
  //   Date(Feb ...): { Date: Date(Feb ...), AAPL: ... (an object in data) },
  //   ...
  // }
  //
  // This allows data to be updated quickly. dataIndex is represented as above,
  // except as a Map.
  const dataIndex = new Map();

  // Lists the symbols we have incorporated into the store.
  const symbols = new Set();

  const getData = () => data;
  const getSymbols = () => Array.from(symbols);

  const incorporateSymbol = (symbol, symbolData) => {
    // Parameter symbolData looks similar to data:
    // [ { Date: Date(Jan ...), Close: 12, Open: 10, ... },
    //   { Date: ... },
    //   ...
    // ]
    //
    // This is to be mixed into the appropriate row in data.

    let newDates = false;

    symbolData.forEach(({ Date, ...rest }) => {
      const addendum = {[symbol]: rest};

      if(dataIndex.has(Date.getTime())) {
        Object.assign(dataIndex.get(Date.getTime()), addendum);
      } else {
        const newDatum = Object.assign({Date}, addendum);

        data.push(newDatum);
        dataIndex.set(Date.getTime(), newDatum);

        newDates = true;
      }
    });

    if(newDates) data.sort(sortByDates);

    symbols.add(symbol);

    return data;
  };

  const incorporateSymbols = (newSymbols, callback = () => null) => {
    const symbolsToProcess = difference(newSymbols, Array.from(symbols));

    return futureFold(
      (_1, i, newData) => {
        incorporateSymbol(symbolsToProcess[i], newData);
        callback(getSymbols());
      },
      null,
      symbolsToProcess.map(getQuoteHistory)
    )
    .map(getSymbols);
  };

  return {
    getData,
    incorporateSymbols,
  };
};
