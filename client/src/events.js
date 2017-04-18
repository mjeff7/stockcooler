// @flow

import type { Color } from './types';

export type EventType
  = 'ADD_SYMBOL'
  | 'REMOVE_SYMBOL'
  | 'SET_SYMBOL_COLOR';

export type Event
  = { type: 'ADD_SYMBOL', payload: string }
  | { type: 'REMOVE_SYMBOL', payload: string }
  | { type: 'SET_SYMBOL_COLOR', payload: {symbol: string, color: Color} }
  | { type: 'ADD_COMMENT', payload: {id: mixed, comment: mixed} }
  | { type: 'REMOVE_COMMENT', payload: mixed }
  | { type: 'ADD_TOAST', payload: {id: mixed, message: mixed} }
  | { type: 'REMOVE_TOAST', payload: mixed }
  ;

type Action<A> = A => Event;
type ActionMaker<A,B> = (EventType,A => B) => Action<A>;

const identity = x => x;
const makeActionMaker: ActionMaker<*,*> = (type, payloadTransformer = identity) => {
  const action: any => any = input => ({
    type,
    payload: payloadTransformer(input)
  });

  action.type = type;

  return action;
};


export const
  addSymbol = makeActionMaker('ADD_SYMBOL', x => x.toUpperCase()),
  removeSymbol = makeActionMaker('REMOVE_SYMBOL', x => x.toUpperCase()),
  setSymbolColor = makeActionMaker('SET_SYMBOL_COLOR',
    (symbol, color) => ({symbol, color})),
  addComment = makeActionMaker('ADD_COMMENT', x => ({id: x, comment: x})),
  removeCommentById = makeActionMaker('REMOVE_COMMENT'),
  addToast = makeActionMaker('ADD_TOAST', x => ({id: x, message: x})),
  removeToastById = makeActionMaker('REMOVE_TOAST')
;
