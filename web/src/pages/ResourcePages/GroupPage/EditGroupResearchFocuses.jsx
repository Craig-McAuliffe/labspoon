import React, {useState} from 'react';
import {useParams} from 'react-router-dom';
import {db} from '../../../firebase';

import {getPaginatedResourcesFromCollectionRef} from '../../../helpers/resources';
import {RESEARCHFOCUS} from '../../../helpers/resourceTypeDefinitions';
import CreateButton from '../../../components/Buttons/CreateButton';
import ResourcesFeed from '../ResourcesFeeds';

export default function EditGroupResearchFocuses({children}) {
  const [groupID, setGroupID] = useState(undefined);

  const groupIDParam = useParams().groupID;
  if (groupID !== groupIDParam) {
    setGroupID(groupIDParam);
  }
  if (groupID === undefined) return null;

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
    ];
  }

  const fetchFeedData = (skip, limit, filterOptions, last) =>
    fetchResearchFocusesFromDB(last, limit);

  return (
    <ResourcesFeed fetchResults={fetchFeedData} limit={9}>
      {children}
      <div className="create-button-center-container">
        <CreateButton
          text="Create Research Focus"
          link={`/create/researchFocus/${groupID}`}
        />
      </div>
    </ResourcesFeed>
  );
}
