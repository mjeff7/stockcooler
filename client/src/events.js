// @flow

import type { Color } from './types';

export type EventType
  = 'INITIAL_STATE'
  | 'ADD_SYMBOL'
  | 'REMOVE_SYMBOL'
  | 'SET_SYMBOL_COLOR'
  | 'ADD_COMMENT'
  | 'REMOVE_COMMENT'
  | 'ADD_TOAST'
  | 'REMOVE_TOAST'
  ;

export type Event
  = { type: 'INITIAL_STATE' }
  | { type: 'ADD_SYMBOL', payload: string }
  | { type: 'REMOVE_SYMBOL', payload: string }
  | { type: 'SET_SYMBOL_COLOR', payload: {symbol: string, color: Color} }
  | { type: 'ADD_COMMENT', payload: {id: mixed, comment: mixed} }
  | { type: 'REMOVE_COMMENT', payload: mixed }
  | { type: 'ADD_TOAST', payload: {id: mixed, message: mixed} }
  | { type: 'REMOVE_TOAST', payload: mixed }
  ;

export type Action<A> = A => Event;

const identity = x => x;
const makeActionMaker = (
  type: EventType,
  payloadTransformer = identity
) => {
  const action = (input: *): Event => ({
    payload: payloadTransformer(input),
    type,
  });

  action.type = type;

  return action;
};

const normalizeSymbol = (x: string) => x.toUpperCase();

export const addSymbol = makeActionMaker('ADD_SYMBOL', normalizeSymbol);
export const removeSymbol = makeActionMaker('REMOVE_SYMBOL', normalizeSymbol);
export const setSymbolColor =
  makeActionMaker('SET_SYMBOL_COLOR', (symbol, color) => ({color, symbol}));
export const addComment =
  makeActionMaker('ADD_COMMENT', x => ({comment: x, id: x}));
export const removeCommentById = makeActionMaker('REMOVE_COMMENT');
export const addToast =
  makeActionMaker('ADD_TOAST', x => ({id: x, message: x}));
export const removeToastById = makeActionMaker('REMOVE_TOAST');
