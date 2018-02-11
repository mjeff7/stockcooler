// @flow

import React from 'react';

type DOMEvent = {key: string, target: {value: string}};
const submitOnEnter = f => (e: DOMEvent) => {
  if(e.key === 'Enter') {
    if(e.target.value !== '') {
      f(e.target.value);
      e.target.value = '';
    }
  }
};

type InputProps = {
  onEnter: string => void
};

export const Input = ({onEnter, ...rest}: InputProps) =>
  <input {...rest} onKeyPress={submitOnEnter(onEnter)}/>;
