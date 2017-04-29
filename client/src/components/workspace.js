// @flow

import React from 'react';
import { Futureall,
         compose,
         concat,
         groupBy,
         intersection,
         map,
         mapObjIndexed,
         memoize,
         mergeAll,
         pipe,
         prop,
         reduce,
         sortBy,
         values,
         zipObj
       } from '../prelude';
import { getQuoteHistory } from '../quotes';
import stateReducer from '../reducer';
import { newDataManager } from '../chartData';

import type { ChartableData, Color } from '../types';

import Resizer from './resizer';
import GuardedChart from './chart';
import InputPanel from './inputPanel';
import { CommentsPanel } from './comment';

import {
  addSymbol,
  removeSymbol,
  addComment,
  removeCommentById
} from '../events';
import type { Event } from '../events';




const Chart = Resizer(GuardedChart);


const WebSocketWrapper = addr => Base => class extends React.Component {
  constructor() {
    super();

    this.subscribers = new Set();

    this.ws = new WebSocket(addr);
    this.ws.addEventListener('message',
      msg => this.emitLocal(JSON.parse(msg.data)));
  }

  subscribe = subscriber => {
    this.subscribers.add(subscriber);
    return () => this.subscribers.remove(subscriber);
  };

  emitLocal = message => this.subscribers.forEach(s => s(message));
  emitAll = message => {
    this.emitLocal(message);
    if(this.ws.readyState === WebSocket.OPEN)
      this.ws.send(JSON.stringify(message));
  };

  render() {
    return <Base
      {...this.props}
      subscribe={this.subscribe}
      emit={this.emitAll}
    />;
  }
};

const Store = stateReducer => Base => class extends React.Component {
  state: mixed;

  state = stateReducer(undefined, {type: 'INITIAL_STATE'});

  componentDidMount() {
    this.props.subscribe(this.handleEventSelf);
    const symbols = this.props.initialSymbols || [];

    this.setState(
      symbols.reduce(
        (state, symbol) => stateReducer(state, addSymbol(symbol)),
        this.state
      )
    );
  }

  handleEventSelf = (e: Event) => {
    this.setState(stateReducer(this.state, e));
  }

  emitEvent = (e: Event) => this.props.emit(e);

  render() {
    return <Base store={this.state}
                 dispatch={this.emitEvent}/>;
  }
};

class DataPrep extends React.Component {
  state: { preparedData: ChartableData,
           preparedSymbols: Array<string>
         };

  state = { preparedData: [],
            preparedSymbols: []
          };

  dataManager = newDataManager();
  desiredSymbols = [];

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    this.useSymbols(props.store.symbols);
  }

  updateSymbols = readySymbols => this.setState({
    preparedSymbols: intersection(readySymbols, this.desiredSymbols)
  });

  useSymbols(symbols : Array<string>) {
    // Store this now so the most recent call will set the result,
    // regardless of the order in which the retrieval settles.
    // Only run if the list has changed.
    if(this.desiredSymbols !== symbols) {
      this.desiredSymbols = symbols;
      this.dataManager.incorporateSymbols(symbols, this.updateSymbols)
      .fork(
        this.handleRetrievalError,
        this.updateSymbols
      );
    }
  }

  handleRetrievalError = (error: {symbol: ?string}) => {
    const symbol = error.symbol;
    console.error({description: 'Failed to fetch data.',
                   symbol,
                   error
                  });
    if(symbol)
      this.props.dispatch(removeSymbol(symbol));
  }

  handlerOf = action => compose(this.props.dispatch, action);

  render() {
    return <div className="workspace">
      <Chart data={this.dataManager.getData()}
             symbols={this.state.preparedSymbols}
             colors={this.props.store.colors}/>
      <InputPanel addSymbol={this.handlerOf(addSymbol)}
                  removeSymbol={this.handlerOf(removeSymbol)}
                  readySymbols={this.state.preparedSymbols}
                  symbols={this.props.store.symbols}
                  colors={this.props.store.colors}/>
      <CommentsPanel comments={this.props.store.comments}
                     addComment={this.handlerOf(addComment)}
                     removeComment={this.handlerOf(removeCommentById)}/>
    </div>;
  }
};


export default compose(
  WebSocketWrapper('ws://localhost:3000/'),
  Store(stateReducer)
)(DataPrep);
