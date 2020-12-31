import React from 'react';
import Spinner from 'react-bootstrap/Spinner';
import {UnpaddedPageContainer} from '../Layout/Content';

import './LoadingSpinner.css';

export default function LoadingSpinner() {
  return (
    <div className="loading-spinner-container">
      <Spinner animation="border" role="status">
        <span className="sr-only">Loading...</span>
      </Spinner>
    </div>
  );
}

export function LoadingSpinnerPage() {
  return (
    <UnpaddedPageContainer>
      <LoadingSpinner />
    </UnpaddedPageContainer>
  );
}
