import React from 'react';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';


export const List = ({children}) =>
  <CSSTransitionGroup
    transitionName="example"
    transitionEnterTimeout={1000}
    transitionLeaveTimeout={1000}
  >
    {children}
  </CSSTransitionGroup>;
