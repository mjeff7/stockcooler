import React from 'react';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';


export const List = ({children}) =>
  <CSSTransitionGroup
    transitionName="example"
    transitionEnterTimeout={250}
    transitionLeaveTimeout={250}
  >
    {children}
  </CSSTransitionGroup>;
