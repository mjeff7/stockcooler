import React from 'react';

import { CloseButton } from './closeButton';
import { List } from './list';

const Toast = ({id, toast: {message}, onClose}) =>
  <div className="toast">
    <span>{message}</span>
    <CloseButton onClose={onClose}/>
  </div>;

export const ToastsPanel = ({toasts, removeToast}) =>
  <div className="toastsPanel">
    <List>
      {toasts.map((toast, i) =>
        <Toast
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />)
      }
    </List>
  </div>;
