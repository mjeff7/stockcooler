import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import React from 'react';


export const List = ({children}) =>
  <CSSTransitionGroup
    transitionName="faderList"
    transitionEnterTimeout={250}
    transitionLeaveTimeout={250}
  >
    {children}
  </CSSTransitionGroup>;
