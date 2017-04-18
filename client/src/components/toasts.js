import React from 'react';

import { CloseButton } from './closeButton';

const Toast = ({id, toast: {message}, onClose}) =>
  <div className="toast">
    <span>{message}</span>
    <CloseButton onClose={onClose}/>
  </div>;

export const ToastsPanel = ({toasts, removeToast}) =>
  <div className="toastsPanel">
    {toasts.map((toast, i) =>
      <Toast
        key={i}
        toast={toast}
        onClose={() => removeToast(toast.id)}
      />)}
  </div>;
