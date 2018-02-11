// @flow

import type { Color } from '../types';
import { Input } from './input';
import { List } from './list';
import React from 'react';
import { WaitSpinner } from './waitSpinner';


const SymbolTag = ({symbol, color, onClick, ready}) =>
  <div
    className="symbolTag"
    style={{backgroundColor: color, color}}
    onClick={onClick}
  >
    <span className="symbolTag-span">
      {symbol}
      {ready || <span> <WaitSpinner className="symbolTag-spinner"/></span>}
    </span>
  </div>;

type InputPanelProps = {
  addSymbol: string => void,
  colors: {[string]: Color},
  removeSymbol: string => void,
  readySymbols : Array<string>,
  symbols : Array<string>
};

const InputPanel = (
  {addSymbol, colors, removeSymbol, readySymbols, symbols} : InputPanelProps
) =>
  <div className="inputPanel">
    <Input
      className="inputPanel-input"
      onEnter={addSymbol}
      placeholder="Symbol"
    />
    <List>
      {symbols.map(symbol =>
        <SymbolTag
          key={symbol}
          symbol={symbol}
          color={colors[symbol]}
          onClick={() => removeSymbol(symbol)}
          ready={readySymbols.includes(symbol)}
        />
      )}
    </List>
  </div>;

export default InputPanel;
