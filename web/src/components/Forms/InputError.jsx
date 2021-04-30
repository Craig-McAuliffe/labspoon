import React from 'react';

import './InputError.css';

const InputError = ({error, noMargin}) => (
  <p className={`error-input-message${noMargin ? '-no-margin' : ''}`}>
    {error}
  </p>
);

export default InputError;
