import React, {useState} from 'react';
import {useParams} from 'react-router-dom';
import {db} from '../../../firebase';

import {getPaginatedResourcesFromCollectionRef} from '../../../helpers/resources';
import {OPENPOSITION} from '../../../helpers/resourceTypeDefinitions';
import CreateButton from '../../../components/Buttons/CreateButton';
import ResourcesFeed from '../ResourcesFeeds';

export default function EditGroupOpenPositions({children}) {
  const [groupID, setGroupID] = useState(undefined);

  const groupIDParam = useParams().groupID;
  if (groupID !== groupIDParam) {
    setGroupID(groupIDParam);
  }
  if (groupID === undefined) return null;

  const openPositionsCollection = db.collection(
    `groups/${groupID}/openPositions`
  );

  function fetchTechniquesFromDB(limit, last) {
    return [
      getPaginatedResourcesFromCollectionRef(
        openPositionsCollection,
        limit,
        last,
        OPENPOSITION
      ),
      null,
    ];
  }

  const fetchFeedData = (skip, limit, filterOptions, last) =>
    fetchTechniquesFromDB(limit, last);

  return (
    <ResourcesFeed fetchResults={fetchFeedData} limit={9}>
      {children}
      <div className="create-button-center-container">
        <CreateButton
          text="Create Open Position"
          link={`/create/openPosition/${groupID}`}
        />
      </div>
    </ResourcesFeed>
  );
}
