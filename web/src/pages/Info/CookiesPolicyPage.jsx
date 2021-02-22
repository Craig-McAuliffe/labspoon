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
        <h4>Preferences Cookies</h4>
        <p>
          For non-signed up users, we use cookies to remember if they have
          already dismissed popups, so that we do not keep showing them the same
          message.
        </p>
      </div>
    </PaddedPageContainer>
  );
}
