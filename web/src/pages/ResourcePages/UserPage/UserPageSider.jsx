import React from 'react';
import {Link} from 'react-router-dom';

import {getSimilarUsers} from '../../../mockdata/users';
import UserAvatar from '../../../components/Avatar/UserAvatar';

export default function UserPageSider({currentUserID}) {
  const search = false;
  return search ? (
    <div>Other users from previous page</div>
  ) : (
    getSimilarUsers(currentUserID).map((similarUser) => (
      <div key={similarUser.id} className="suggested-user">
        <Link to={`/user/${similarUser.id}`}>
          <UserAvatar src={similarUser.avatar} width="60px" />
          <h4>{similarUser.name} </h4>
        </Link>
      </div>
    ))
  );
}
