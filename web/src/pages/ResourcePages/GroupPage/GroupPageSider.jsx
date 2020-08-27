import React from 'react';
import {Link} from 'react-router-dom';
import {findSimilarGroups} from '../../../mockdata/groups';
import UserAvatar from '../../../components/Avatar/UserAvatar';

import './GroupPage.css';

export default function ({group}) {
  if (group === undefined || group.topics === undefined) return <></>;
  const search = false;

  const groupsFromSearch = () => {
    return <div>Groups from search</div>;
  };

  const suggestedGroups = () => {
    return findSimilarGroups(group.topics, group.id).map((similarGroup) => (
      <div key={similarGroup.id} className="suggested-group-container">
        <Link to={`/group/${similarGroup.id}`} className="suggested-group-link">
          <UserAvatar src={similarGroup.avatar} width="60px" height="60px" />
          <div>{similarGroup.name}</div>
        </Link>
      </div>
    ));
  };
  return search ? groupsFromSearch() : suggestedGroups();
}
