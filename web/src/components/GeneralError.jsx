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
          Hmmm, something went wrong. Don&#39;t worry, it&#39;s us not you. Try
          refreshing your page.
        </h2>
      )}
    </div>
  );
}
