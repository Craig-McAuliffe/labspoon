import React, {useContext, useState} from 'react';
import SecondaryButton from '../../../components/Buttons/SecondaryButton';
import LinkAuthorIDForm from '../../../components/Publication/ConnectToPublications/ConnectToPublications';
import {PaddedPageContainer} from '../../../components/Layout/Content';
import {AuthContext} from '../../../App';
import {LoadingSpinnerPage} from '../../../components/LoadingSpinner/LoadingSpinner';

import './UserPage.css';
import './EditUserPage.css';

export default function EditUserPublications({children}) {
  const [linkingAuthor, setLinkingAuthor] = useState(false);
  const {userProfile} = useContext(AuthContext);
  if (!userProfile) return <LoadingSpinnerPage />;
  if (userProfile.microsoftAcademicAuthorID)
    return (
      <PaddedPageContainer>
        {children}
        <h3>You have already linked publications to your user profile</h3>
        <p>
          If you have incorrectly linked your account, please email{' '}
          <a href={'mailto:help@labspoon.com'}>help@labspoon.com</a>
        </p>
        <p className="link-to-pubs-already-linked-note">
          <b>Note:</b> We are constantly indexing more publications, so if any
          are missing they will probably appear soon.
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
