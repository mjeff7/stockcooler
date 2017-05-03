// @flow

import React from 'react';
import { compose,
         intersection,
       } from '../prelude';
import stateReducer from '../reducer';
import { newDataManager } from '../chartData';

import type { ChartableData } from '../types';

import Resizer from './resizer';
import GuardedChart from './chart';
import InputPanel from './inputPanel';
import { CommentsPanel } from './comment';
import { ToastsPanel } from './toasts';

import {
  addSymbol,
  removeSymbol,
  addComment,
  removeCommentById,
  addToast,
  removeToastById
} from '../events';
import type { Event } from '../events';




const Chart = Resizer(GuardedChart);


const webSocketHub = addr => {
  const subscribers = new Set();
  const ws = new WebSocket(addr);

  const subscribe = subscriber => {
    subscribers.add(subscriber);
    return () => subscribers.remove(subscriber);
  };

  const emitLocal = message => subscribers.forEach(s => s(message));
  const emit = message => {
    emitLocal(message);
    if(ws.readyState === WebSocket.OPEN)
      ws.send(JSON.stringify(message));
  };

  ws.addEventListener('message',
    msg => emitLocal(JSON.parse(msg.data))
  );

  return {
    subscribe,
    emit
  };
};

const storeMaker = stateReducer => {
  let state = stateReducer(undefined, {type: 'INITIAL_STATE'});

  const dispatch = (e: Event) =>
    state = stateReducer(state, e);

  const getState = () => state;

  return {
    dispatch,
    getState
  };
};

const ConnectedStore = (stateReducer, addr) => Base =>
  class extends React.Component {
    store = storeMaker(stateReducer);
    hub = webSocketHub(addr);
    state = { store: this.store.getState() };

    constructor() {
      super();
      this.hub.subscribe(this.handleEventSelf);
    }

    handleEventSelf = e => {
      this.store.dispatch(e);
      this.setState({store: this.store.getState()});
    };

    render() {
      return <Base {...this.props}
        store={this.state.store}
        dispatch={this.hub.emit}
      />;
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
    this.props.dispatch(addToast(
      `Oops...I couldn't fetch data for ${symbol}`
    ));

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
      <ToastsPanel toasts={this.props.store.toasts}
                   removeToast={this.handlerOf(removeToastById)}/>
    </div>;
  }
};


export default ConnectedStore(stateReducer, 'ws://localhost:3000/')(DataPrep);
