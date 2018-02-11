import React from 'react';
import spinnerImg from '../spinner.svg';

export const WaitSpinner = ({className, ...rest}) =>
  <img
    className={`spin spinner ${className}`}
    src={spinnerImg}
    alt="Waiting"
    {...rest}
  />;
