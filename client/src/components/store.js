// @flow

import React from 'react';

import { webSocketHub } from '../websocket';
import { addToast } from '../events';


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

export const connectStore =
  (stateReducer, addr, shouldShare = () => true) =>
  Base => {
  class ConnectStore extends React.Component {
    store = storeMaker(stateReducer);
    hub = webSocketHub(addr, error => this.hub.emit(addToast(
      `Could not connect to a websocket at ${addr}. No collaboration for you.`
    )));
    state = { store: this.store.getState() };

    constructor() {
      super();
      this.hub.subscribe(this.handleEventSelf);
    }

    handleEventSelf = (e: Event) => {
      this.store.dispatch(e);
      this.setState({store: this.store.getState()});
    };

    dispatch = (e: Event) =>
      shouldShare(e)
      ? this.hub.emit(e)
      : this.handleEventSelf(e)

    render() {
      return <Base {...this.props}
        store={this.state.store}
        dispatch={this.dispatch}
      />;
    }
  }

  ConnectStore.displayName = `ConnectStore→${Base.displayName || Base.name}`;

  return ConnectStore;
};
