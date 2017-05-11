// @flow

import React from 'react';
import { compose,
       } from '../prelude';
import stateReducer from '../reducer';

import resizer from './resizer';
import GuardedChart from './chart';
import InputPanel from './inputPanel';
import { CommentsPanel } from './comment';
import { ToastsPanel } from './toasts';

import { prepareData } from './prepareData';
import { connectStore } from './store';

import {
  addSymbol,
  removeSymbol,
  addComment,
  removeCommentById,
  //addToast,
  //removeToastById
} from '../events';

const eventTypesToShare = new Set(
  [
    addSymbol,
    removeSymbol,
    addComment,
    removeCommentById,
    //addToast,
    //removeToastById
  ].map(a => a.type)
);


const Chart = resizer(GuardedChart);
Chart.displayName = 'Chart';

const Workspace = ({
  data, colors,

  symbols, readySymbols,
  addSymbol, removeSymbol,

  comments,
  addComment, removeComment,

  toasts,
  removeToast,
}) =>
  <div className="workspace">
    <Chart data={data}
           symbols={symbols}
           readySymbols={readySymbols}
           colors={colors}/>
    <InputPanel addSymbol={addSymbol}
                removeSymbol={removeSymbol}
                readySymbols={readySymbols}
                symbols={symbols}
                colors={colors}/>
    <CommentsPanel comments={comments}
                   addComment={addComment}
                   removeComment={removeComment}/>
    <ToastsPanel toasts={toasts}
                 removeToast={removeToast}/>
  </div>;


export default compose(
  connectStore(
    stateReducer,
    'ws://192.168.1.70:3000/',
    e => eventTypesToShare.has(e.type)
  ),
  prepareData
)(Workspace);
