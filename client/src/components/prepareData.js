// @flow

import React from 'react';

import { compose,
         intersection,
       } from '../prelude';
import { newDataManager } from '../chartData';

import {
  addSymbol,
  removeSymbol,
  addComment,
  removeCommentById,
  addToast,
  removeToastById
} from '../events';

export const prepareData = Base => {
  class PrepareData extends React.Component {
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

        // This is necessary so that removals while incorporateSymbols is
        // running will register immediately.
        this.updateSymbols(this.state.preparedSymbols);
        this.dataManager.incorporateSymbols(symbols, this.updateSymbols)
        .fork(
          this.handleRetrievalError,
          this.updateSymbols
        );
      }
    }

    handleRetrievalError = (error: {symbol?: string}) => {
      const symbol = error.symbol;
      console.error({description: 'Failed to fetch data.',
                     symbol,
                     error
                    });
      this.props.dispatch(addToast(
        "Oops...I couldn't fetch data" +
        (symbol ? ` for ${symbol}` : ", and I don't know what symbol it was.")
      ));

      if(symbol)
        this.props.dispatch(removeSymbol(symbol));
    }

    handlerOf = action => compose(this.props.dispatch, action);

    render() {
      return <Base {...this.props}
        data={this.dataManager.getData()}
        colors={this.props.store.colors}

        symbols={this.props.store.symbols}
        readySymbols={this.state.preparedSymbols}
        addSymbol={this.handlerOf(addSymbol)}
        removeSymbol={this.handlerOf(removeSymbol)}

        comments={this.props.store.comments}
        addComment={this.handlerOf(addComment)}
        removeComment={this.handlerOf(removeCommentById)}

        toasts={this.props.store.toasts}
        removeToast={this.handlerOf(removeToastById)}
      />;
    }
  }

  PrepareData.displayName = `PreparedDatax→${Base.displayName || Base.name}`;

  return PrepareData;
};
