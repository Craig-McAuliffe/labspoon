import React from 'react';
import {PaddedPageContainer} from '../../components/Layout/Content';

import './CookiesPolicyPage.css';

export default function CookiesPolicyPage() {
  return (
    <PaddedPageContainer>
      <div className="cookies-policy-container">
        <h1>Cookies Policy</h1>
        <h3>Cookies we store</h3>
        <p>
          We only store essential cookies. Below is the list of these essential
          cookies.
        </p>
        <h4>Recaptcha Cookies</h4>
        <p>These cookies are required to prevent spammers and bots.</p>
        <h4>Login Cookies</h4>
        <p>
          These cookies are required to keep our users logged in between
          sessions.
        </p>
      </div>
    </PaddedPageContainer>
  );
}
