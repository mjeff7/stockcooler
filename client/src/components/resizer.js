import React from 'react';
import Measure from 'react-measure';

export const Resizer = Base => props =>
  <Measure>{
    ({width, height}) =>
      <div className="resizer">
        <Base {...props} width={width} height={height}/>
    </div>
  }</Measure>;

export default Resizer;
