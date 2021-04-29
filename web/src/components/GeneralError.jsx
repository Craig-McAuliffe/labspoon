import React from 'react';
import errorIcon from '../assets/errorIcon.svg';
import {UnpaddedPageContainer} from './Layout/Content';

export default function GeneralError({children}) {
  return (
    <UnpaddedPageContainer>
      <div className="error-container">
        <img
          style={{maxWidth: '20%', height: 'auto'}}
          src={errorIcon}
          alt="Bug fixing illustration"
        />
        {children ? (
          children
        ) : (
          <h3>
            Hmm, something went wrong. Don&#39;t worry, it&#39;s us not you. Try
            refreshing your page.
          </h3>
        )}
      </div>
    </UnpaddedPageContainer>
  );
}

export function AuthError() {
  return (
    <UnpaddedPageContainer>
      <div className="error-container">
        <h3>You do not have permission to view this page.</h3>
      </div>
    </UnpaddedPageContainer>
  );
}
