import React from 'react';

import './InputError.css';

const InputError = ({error}) => (
  // The div will break the error message onto the next row.
  <div>
    <p className="error-input-message">{error}</p>
  </div>
);

export default InputError;
