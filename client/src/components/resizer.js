import Measure from 'react-measure';
import React from 'react';

export const resizer = Base => {
  const Resizer = props =>
    <Measure>{
      ({width, height}) =>
        <div className="resizer">
          <Base {...props} width={width} height={height}/>
      </div>
    }</Measure>;

  Resizer.displayName = `Resizer→${Base.displayName || Base.name}`;

  return Resizer;
};

export default resizer;
