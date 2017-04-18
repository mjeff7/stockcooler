// @flow

import React from 'react';
import { Input } from './input.js';

import type { Color } from '../types';

const InputPanel =
  ({addSymbol, colors, removeSymbol, readySymbols, symbols}
    : {addSymbol: string => void,
       colors: {[string]: Color},
       removeSymbol: string => void,
       readySymbols : Array<string>,
       symbols : Array<string>}) =>
  <div className="inputPanel">
    <Input
      className="inputPanel-input"
      onEnter={addSymbol}
      placeholder="Enter a symbol"
    />
    {symbols.map(s =>
      <div key={s}
           className="symbolTag"
           style={{color: colors[s], backgroundColor: colors[s]}}
           onClick={() => removeSymbol(s)}>
        <span className="symbolTag-span">
          {s}{readySymbols.includes(s) || " (?)"}
        </span>
      </div>)
    }
  </div>;

export default InputPanel;
