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

export const Input =
  ({onEnter, ...rest}:
    {onEnter: string => void}
  ) =>
  <input {...rest} onKeyPress={submitOnEnter(onEnter)}/>;
