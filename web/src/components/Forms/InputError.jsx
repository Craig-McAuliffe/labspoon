import React from 'react';

import './InputError.css';

const InputError = ({error}) => (
  // The div will break the error message onto the next row.
  <div>
    <small className="error-input-message">{error}</small>
  </div>
);

export default InputError;
