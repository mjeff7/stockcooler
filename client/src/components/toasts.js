import { CloseButton } from './closeButton';
import { List } from './list';
import React from 'react';

const Toast = ({toast: {message}, onClose}) =>
  <div className="toast">
    <span>{message}</span>
    <CloseButton onClose={onClose}/>
  </div>;

export const ToastsPanel = ({toasts, removeToast}) =>
  <div className="toastsPanel">
    <List>
      {toasts.map(toast =>
        <Toast
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />)
      }
    </List>
  </div>;
