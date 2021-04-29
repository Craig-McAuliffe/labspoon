import React, {useState} from 'react';
import {useParams} from 'react-router-dom';
import {db} from '../../../firebase';

import {getPaginatedResourcesFromCollectionRef} from '../../../helpers/resources';
import {GROUPS, TECHNIQUE} from '../../../helpers/resourceTypeDefinitions';
import CreateButton from '../../../components/Buttons/CreateButton';
import ResourcesFeed from '../ResourcesFeeds';
import CreateTechnique from '../../../components/Techniques/CreateTechnique';
import {PaddedPageContainer} from '../../../components/Layout/Content';
import SuccessMessage from '../../../components/Forms/SuccessMessage';

export default function EditGroupTechniques({children}) {
  const [groupID, setGroupID] = useState(null);
  const [creatingTechnique, setCreatingTechnique] = useState(false);
  const [success, setSuccess] = useState(false);

  const groupIDParam = useParams().groupID;
  if (groupID !== groupIDParam) {
    setGroupID(groupIDParam);
  }
  if (!groupID) return null;

  const techniquesCollection = db.collection(`groups/${groupID}/techniques`);

  function fetchTechniquesFromDB(last, limit) {
    return [
      getPaginatedResourcesFromCollectionRef(
        techniquesCollection,
        limit,
        last,
        TECHNIQUE
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
    fetchTechniquesFromDB(last, limit);

  return creatingTechnique ? (
    <PaddedPageContainer>
      {children}
      <CreateTechnique
        cancelAction={() => setCreatingTechnique(false)}
        groupID={groupID}
        successFunction={() => {
          setCreatingTechnique(false);
          setSuccess(true);
        }}
      />
    </PaddedPageContainer>
  ) : (
    <ResourcesFeed fetchResults={fetchFeedData} limit={9}>
      {children}
      <div className="create-button-center-container">
        <CreateButton
          text="Create Technique"
          buttonAction={() => {
            setCreatingTechnique(true);
            if (success) setSuccess(false);
          }}
        />
      </div>
      {success && <SuccessMessage>Technique created!</SuccessMessage>}
    </ResourcesFeed>
  );
}
