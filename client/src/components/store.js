// @flow

import type { Event } from '../events';
import React from 'react';
import { addToast } from '../events';
import { compose } from '../prelude';
import { webSocketHub } from '../websocket';


const storeMaker = stateReducer => {
  let state = stateReducer(void '', {type: 'INITIAL_STATE'});

  const dispatch = (e: Event) => {
    state = stateReducer(state, e);
  };

  const getState = () => state;

  return {
    dispatch,
    getState,
  };
};

const stateComponent =
  stateReducer =>
  Base => {
    class State extends React.Component {
      store = storeMaker(stateReducer);
      state = { store: this.store.getState() };

      handleEvent = (e: Event) => {
        this.store.dispatch(e);
        this.setState({store: this.store.getState()});
      };

      render() {
        return <Base {...this.props}
          store={this.state.store}
          dispatch={this.handleEvent}
        />;
      }
    }

    State.displayName = `State→${Base.displayName || Base.name}`;

    return State;
  };

const webSocketComponent =
  (addr, shouldShare = () => true) =>
  Base => {
    class WebSocketHOC extends React.Component {
      hub: {
        emit: Event => void,
      };

      componentWillMount() {
        this.hub = webSocketHub(addr, error => {
          console.error('Could not connect to websocket. ', {error});

          this.props.dispatch(addToast(
            `Could not connect to a websocket at ${addr}. ` +
            'No collaboration for you.'
          ));
        });

        this.hub.subscribe(this.props.dispatch);
      }

      dispatch = (e: Event) => {
        this.props.dispatch(e);

        if(shouldShare(e)) this.hub.emit(e);
      };

      render() {
        return <Base {...this.props}
          dispatch={this.dispatch}
        />;
      }
    }

    WebSocketHOC.displayName = `WebSocketHOC→${Base.displayName || Base.name}`;

    return WebSocketHOC;
  };

export const connectStore = (
  // Bug in eslint: Currently believes A is undefined'
  // eslint-disable-next-line no-undef
  stateReducer: <A>(A, Event) => A,
  addr: string,
  shouldShare: Event => boolean = () => true,
) =>
  compose(
    stateComponent(stateReducer),
    webSocketComponent(addr, shouldShare)
  );
