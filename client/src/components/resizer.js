import React from 'react';
import Measure from 'react-measure';

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
