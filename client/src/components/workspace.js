// @flow

import { CommentsPanel } from './comment';
import GuardedChart from './chart';
import InputPanel from './inputPanel';
import React from 'react';
import { ToastsPanel } from './toasts';
import { compose } from '../prelude';
import { connectStore } from './store';
import { prepareData } from './prepareData';
// Bug in eslint incorrectly believes this is being exported.
// eslint-disable-next-line import/no-named-as-default
import resizer from './resizer';
// Bug in eslint incorrectly believes this is being exported.
// eslint-disable-next-line import/no-named-as-default
import stateReducer from '../reducer';


import {
  addComment,
  addSymbol,
  removeCommentById,
  removeSymbol,
  // Exclude:
  //   addToast,
  //   removeToastById
} from '../events';

const eventTypesToShare = new Set(
  [
    addComment,
    addSymbol,
    removeCommentById,
    removeSymbol,
    // Exclude:
    //   addToast,
    //   removeToastById
  ].map(a => a.type)
);


const Chart = resizer(GuardedChart);

Chart.displayName = 'Chart';

const Workspace = ({
  data, colors,

  /* eslint-disable no-shadow */
  symbols, readySymbols,
  addSymbol, removeSymbol,

  comments,
  addComment, removeComment,

  toasts,
  removeToast,
}) =>
  <div className="workspace">
    <Chart
      data={data}
      symbols={symbols}
      readySymbols={readySymbols}
      colors={colors}
    />
    <InputPanel
      addSymbol={addSymbol}
      removeSymbol={removeSymbol}
      readySymbols={readySymbols}
      symbols={symbols}
      colors={colors}
    />
    <CommentsPanel
      comments={comments}
      addComment={addComment}
      removeComment={removeComment}
    />
    <ToastsPanel
      toasts={toasts}
      removeToast={removeToast}
    />
  </div>;


export default compose(
  connectStore(
    stateReducer,
    `ws://${window.location.host}/`,
    e => eventTypesToShare.has(e.type)
  ),
  prepareData
)(Workspace);
