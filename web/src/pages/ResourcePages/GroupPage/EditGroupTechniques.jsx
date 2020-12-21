import React, {useState} from 'react';
import {useParams} from 'react-router-dom';
import {db} from '../../../firebase';

import {getPaginatedResourcesFromCollectionRef} from '../../../helpers/resources';
import {TECHNIQUE} from '../../../helpers/resourceTypeDefinitions';
import CreateButton from '../../../components/Buttons/CreateButton';
import ResourcesFeed from '../ResourcesFeeds';

export default function EditGroupTechniques({children}) {
  const [groupID, setGroupID] = useState(undefined);

  const groupIDParam = useParams().groupID;
  if (groupID !== groupIDParam) {
    setGroupID(groupIDParam);
  }
  if (groupID === undefined) return null;

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
    ];
  }

  const fetchFeedData = (skip, limit, filterOptions, last) =>
    fetchTechniquesFromDB(last, limit);

  return (
    <ResourcesFeed fetchResults={fetchFeedData} limit={9}>
      {children}
      <div className="create-button-center-container">
        <CreateButton
          text="Create Technique"
          link={`/create/technique/${groupID}`}
        />
      </div>
    </ResourcesFeed>
  );
}
