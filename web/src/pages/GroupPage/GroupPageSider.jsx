import React from 'react';
import {Link} from 'react-router-dom';
import {findSimilarGroups} from '../../mockdata/groups';

export default function ({groupID}) {
  const search = false;

  const groupsFromSearch = () => {
    return <div>Groups from search</div>;
  };

  const suggestedGroups = () => {
    return findSimilarGroups(groupID).map((similarGroup) => (
      <div key={similarGroup.id}>
        <Link to={`/group/${similarGroup.id}`}>{similarGroup.avatar}</Link>
        <Link to={`/group/${similarGroup.id}`}>{similarGroup.name}</Link>
      </div>
    ));
  };
  return search ? groupsFromSearch() : suggestedGroups();
}
