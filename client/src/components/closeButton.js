import React from 'react';

export const CloseButton = ({
  onClose,
  ...rest
}) =>
  <div className="close" onClick={onClose} {...rest}>×</div>;
