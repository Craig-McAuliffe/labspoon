import React from 'react';
import {Link} from 'react-router-dom';
import {PaddedPageContainer} from '../../components/Layout/Content';

import './PoliciesPage.css';
export default function PoliciesPage() {
  return (
    <PaddedPageContainer>
      <h1 className="policies-page-title"> Our Policies</h1>
      <div className="policies-page-link-container">
        <Link to="/privacy-policy">
          <h2>Privacy Policy</h2>
        </Link>
      </div>
      <div className="policies-page-link-container">
        <Link to="/cookies-policy">
          <h2>Cookies Policy</h2>
        </Link>
      </div>
    </PaddedPageContainer>
  );
}
