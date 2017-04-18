import { Futureall,
         compose,
         concat,
         difference,
         groupBy,
         map,
         mapObjIndexed,
         mergeAll,
         pipe,
         prop,
         reduce,
         sortBy,
         uniq,
         values,
         zipObj
       } from './prelude';
import { getQuoteHistory } from './quotes';


const datesIntsToDates = (x:{Date: number}) =>
  Object.assign({}, x, {Date: new Date(x.Date)});

const datesOut_ =
  mapObjIndexed(
    (val, key) => val.map(
      ({Date, ...rest}) => ({Date: Date, [key]: rest})
    )
  );

const mergeDataSets : ({ [string]: Array<{Date: mixed}> }) => ChartableData =
  pipe(
    map(x => x.filter(i => Object.keys(i).length > 1)),
    datesOut_,
    values,
    reduce(concat, []),
    groupBy(prop('Date')),
    values,
    map(mergeAll),
    sortBy(prop('Date')),
    map(datesIntsToDates)
  );

export const gatherDataForSymbols = symbols =>
   Futureall(symbols.map(getQuoteHistory))
  .map(zipObj(symbols))
  .map(mergeDataSets);


