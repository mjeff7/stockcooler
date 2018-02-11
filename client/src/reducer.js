import { pickNewColor } from './colors';
import { difference,
         uniq,
       } from './prelude';


type Reducer<S> = (S, Event) => S;

const combineReducers =
  (reducerMap: {[string]: Reducer<*>}) =>
  (state = {}, e : Event) =>
  Object.assign({}, ...Object.keys(reducerMap).map(key =>
    ({[key]: reducerMap[key](state[key], e)})
  ));

const normalizeSymbolList = symbols =>
  uniq(symbols.map(x => x.toUpperCase())).sort();
const symbolsReducer = (symbols = [], {type, payload}: Event) => {
  switch(type) {
    case 'ADD_SYMBOL':
      return normalizeSymbolList(symbols.concat(payload));
    case 'REMOVE_SYMBOL':
      return normalizeSymbolList(difference(symbols, [payload]));
    default:
      return symbols;
  }
};

const colorsReducer = (colors = {}, {type, payload}: Event) => {
  switch(type) {
    case 'SET_SYMBOL_COLOR':
      return Object.assign({}, colors, {[payload.symbol]: payload.color});
    case 'ADD_SYMBOL': {
      const symbol = payload;

      return typeof colors[symbol] === 'undefined'
        ? Object.assign(
            {},
            colors,
            {[symbol]: pickNewColor(Object.values(colors))}
          )
        : colors;
    }
    default:
      return colors;
  }
};

const commentsReducer = (
  comments = [{comment: 'Dummy comment', id: 0}],
  {type, payload}
) => {
  switch(type) {
    case 'ADD_COMMENT':
      return comments.concat([payload]);
    case 'REMOVE_COMMENT':
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
    case 'ADD_TOAST' :
      return toasts.concat([payload]);
    case 'REMOVE_TOAST' :
      return toasts.filter(t => t.id !== payload);
    default:
      return toasts;
  }
};


const stateReducer_ = combineReducers({
  colors: colorsReducer,
  comments: commentsReducer,
  symbols: symbolsReducer,
  toasts: toastsReducer,
});

export const stateReducer = (state, event = {}) =>
  stateReducer_(
    event.type === 'SET_INITIAL_STATE' ? event.payload : state,
    event
  );

export default stateReducer;
