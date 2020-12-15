import React from 'react';
import errorIcon from '../assets/errorIcon.svg';

export default function GeneralError({children}) {
  return (
    <div className="error-container">
      <img
        style={{maxWidth: '20%', height: 'auto'}}
        src={errorIcon}
        alt="Bug fixing illustration"
      />
      {children ? (
        children
      ) : (
        <h2>
          Oops, something went wrong. Patrick and Craig personally apologise for
          the inconvenience.
        </h2>
      )}
    </div>
  );
}
