import { difference,
         uniq,
       } from './prelude';

import { pickNewColor } from './colors';


type Reducer<S> = (S, Event) => S;

const combineReducers =
  (reducerMap: {[string]: Reducer<*>}) =>
  (state = {}, e : Event) =>
  Object.assign({}, ...Object.keys(reducerMap).map(key =>
    ({[key]: reducerMap[key](state[key],e)})
  ));

const normalizeSymbolList = symbols =>
  uniq(symbols.map(x => x.toUpperCase())).sort();
const symbolsReducer = (symbols = [], {type, payload}: any /*Event*/) => {
  switch(type) {
    case 'ADD_SYMBOL':
      return normalizeSymbolList(symbols.concat(payload));
    case 'REMOVE_SYMBOL':
      return normalizeSymbolList(difference(symbols, [payload]));
    default:
      return symbols;
  }
};

const colorsReducer = (colors = {}, {type, payload}: any /*Event*/) => {
  switch(type) {
    case('SET_SYMBOL_COLOR'):
      return Object.assign({}, colors, {[payload.symbol]: payload.color});
    case('ADD_SYMBOL'):
      const symbol = payload;
      return colors[symbol] !== undefined
             ? colors
             : Object.assign({}, colors,
                             {[symbol]: pickNewColor(Object.values(colors))}
               );
    default:
      return colors;
  }
};

const commentsReducer = (
  comments = [{id: 0, comment: "Dummy comment"}],
  {type, payload}
) => {
  switch(type) {
    case('ADD_COMMENT'):
      return comments.concat([payload]);
    case('REMOVE_COMMENT'):
      return comments.filter(({id}) => id !== payload);
    default:
      return comments;
  }
 };

const toastsReducer = (
  toasts = [],
  {type, payload}
) => {
  switch(type) {
    case('ADD_TOAST'):
      return toasts.concat([payload]);
    case('REMOVE_TOAST'):
      return toasts.filter(t => t.id !== payload);
    default:
      return toasts;
  }
};



const stateReducer_ = combineReducers({
  symbols: symbolsReducer,
  colors: colorsReducer,
  comments: commentsReducer,
  toasts: toastsReducer,
});

export const stateReducer = (state, event = {}) =>
  stateReducer_(
    event.type === 'SET_INITIAL_STATE' ? event.payload : state,
    event
  );

export default stateReducer;
