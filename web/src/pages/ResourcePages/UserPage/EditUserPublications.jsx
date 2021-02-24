import React, {useContext, useState} from 'react';
import SecondaryButton from '../../../components/Buttons/SecondaryButton';
import LinkAuthorIDForm from '../../../components/Publication/ConnectToPublications/ConnectToPublications';
import {PaddedPageContainer} from '../../../components/Layout/Content';
import {AuthContext} from '../../../App';
import {LoadingSpinnerPage} from '../../../components/LoadingSpinner/LoadingSpinner';
import {Link} from 'react-router-dom';

import './UserPage.css';
import './EditUserPage.css';

export default function EditUserPublications({children}) {
  const [linkingAuthor, setLinkingAuthor] = useState(false);
  const [fetchingMorePubs, setFetchingMorePubs] = useState(false);
  const {userProfile, user, authLoaded} = useContext(AuthContext);
  if (!authLoaded) return <LoadingSpinnerPage />;
  if (user && !userProfile) return null;
  if (userProfile.microsoftID)
    return (
      <PaddedPageContainer>
        {children}
        <h3>Your publications are linked!</h3>
        <div className="edit-user-pubs-fetch-more-button-container">
          {fetchingMorePubs ? (
            <div className="edit-user-pubs-fetching">
              Fetching<div className="edit-user-pubs-fetching-dots"></div>
            </div>
          ) : (
            <SecondaryButton
              onClick={() =>
                fetchRecentPublications(user.uid, setFetchingMorePubs)
              }
            >
              Fetch Recent Publications
            </SecondaryButton>
          )}
        </div>
        <p className="link-to-pubs-already-linked-note">
          If you have incorrectly linked your account, please let us know
          through the <Link to="/contact">contact page.</Link>
        </p>
      </PaddedPageContainer>
    );

  return (
    <PaddedPageContainer>
      {children}
      {linkingAuthor ? (
        <LinkUserToPublications setLinkingAuthor={setLinkingAuthor} />
      ) : (
        <div className="link-user-to-publications-button-container">
          <SecondaryButton onClick={() => setLinkingAuthor(true)}>
            Connect publications to profile
          </SecondaryButton>
        </div>
      )}
    </PaddedPageContainer>
  );
}

function LinkUserToPublications({setLinkingAuthor}) {
  const cancel = () => setLinkingAuthor(false);
  return <LinkAuthorIDForm cancel={cancel} submitBehaviour={cancel} />;
}

function fetchRecentPublications(userID, setFetchingMorePubs) {
  setFetchingMorePubs(true);
}
