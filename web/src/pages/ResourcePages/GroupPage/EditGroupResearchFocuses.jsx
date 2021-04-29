import React, {useState} from 'react';
import {useParams} from 'react-router-dom';
import {db} from '../../../firebase';

import {getPaginatedResourcesFromCollectionRef} from '../../../helpers/resources';
import {GROUPS, RESEARCHFOCUS} from '../../../helpers/resourceTypeDefinitions';
import CreateButton from '../../../components/Buttons/CreateButton';
import ResourcesFeed from '../ResourcesFeeds';
import CreateResearchFocus from '../../../components/ResearchFocus/CreateResearchFocus';
import {PaddedPageContainer} from '../../../components/Layout/Content';
import SuccessMessage from '../../../components/Forms/SuccessMessage';

export default function EditGroupResearchFocuses({children}) {
  const [groupID, setGroupID] = useState(null);
  const [creatingResearchFocus, setCreatingResearchFocus] = useState(false);
  const [success, setSuccess] = useState(false);

  const groupIDParam = useParams().groupID;
  if (groupID !== groupIDParam) {
    setGroupID(groupIDParam);
  }
  if (!groupID) return null;

  const techniquesCollection = db.collection(
    `groups/${groupID}/researchFocuses`
  );

  function fetchResearchFocusesFromDB(last, limit) {
    return [
      getPaginatedResourcesFromCollectionRef(
        techniquesCollection,
        limit,
        last,
        RESEARCHFOCUS
      ),
      null,
      {
        showPinOption: true,
        pinProfileCollection: GROUPS,
        pinProfileID: groupID,
        userCanEdit: true,
      },
    ];
  }

  const fetchFeedData = (skip, limit, filterOptions, last) =>
    fetchResearchFocusesFromDB(last, limit);

  return creatingResearchFocus ? (
    <PaddedPageContainer>
      {children}
      <CreateResearchFocus
        cancelAction={() => setCreatingResearchFocus(false)}
        groupID={groupID}
        successFunction={() => {
          setCreatingResearchFocus(false);
          setSuccess(true);
        }}
      />
    </PaddedPageContainer>
  ) : (
    <ResourcesFeed fetchResults={fetchFeedData} limit={9}>
      {children}
      <div className="create-button-center-container">
        <CreateButton
          text="Create Research Focus"
          buttonAction={() => {
            setCreatingResearchFocus(true);
            if (success) setSuccess(false);
          }}
        />
      </div>
      {success && <SuccessMessage>Research focus created!</SuccessMessage>}
    </ResourcesFeed>
  );
}
