import React, {useContext, useState} from 'react';
import {Alert} from 'react-bootstrap';
import {Link, Redirect, useLocation} from 'react-router-dom';
import {AuthContext} from '../App';
import SecondaryButton from '../components/Buttons/SecondaryButton';
import SuccessMessage from '../components/Forms/SuccessMessage';
import {PaddedPageContainer} from '../components/Layout/Content';
import LinkAuthorIDForm from '../components/Publication/ConnectToPublications/ConnectToPublications';

import './GeneratedPasswordPage.css';
export default function GeneratedPasswordPage() {
  const {user} = useContext(AuthContext);
  const [isLinked, setIsLinked] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const locationState = useLocation().state;
  if (!locationState || !user) return <Redirect to="/" />;

  const linkToAthorSection = isLinking ? (
    isLinked ? (
      <SuccessMessage>Publications linked to your profile!</SuccessMessage>
    ) : (
      <LinkAuthorIDForm
        submitBehaviour={() => setIsLinked(true)}
        cancel={() => setIsLinking(false)}
      />
    )
  ) : (
    <div className="connect-publications-button-container">
      <SecondaryButton onClick={() => setIsLinking(true)}>
        Connect your publications
      </SecondaryButton>
    </div>
  );
  return (
    <PaddedPageContainer>
      <Alert variant="primary">
        <div className="generated-password-page-code-container">
          <h4>Your password to login is:</h4>
          <p>{locationState.password}</p>
        </div>
      </Alert>
      <p>Keep it safe - you won&#39;t be able to view this page again.</p>
      <div className="generated-password-connect-author-id-section">
        {linkToAthorSection}
      </div>
      <div className="generated-password-page-go-to-resource-section">
        <h2>
          <Link
            to={`/${locationState.resourceType}/${locationState.resourceID}`}
          >
            Go to {locationState.resourceType}
          </Link>
        </h2>
      </div>
    </PaddedPageContainer>
  );
}

// 24e1289d-fcd5-49b2-abb2-35afed1b1e47
