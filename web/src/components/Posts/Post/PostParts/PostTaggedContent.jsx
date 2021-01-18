import React from 'react';

import {PUBLICATION, USER} from '../../../../helpers/resourceTypeDefinitions';
import PublicationListItem from '../../../Publication/PublicationListItem';
import FollowUserButton from '../../../User/FollowUserButton/FollowUserButton';
import UserListItem from '../../../User/UserListItem';

import './PostTaggedContent.css';

export default function PostOptionalTags({taggedContent}) {
  if (!taggedContent || taggedContent.length === 0) return null;
  {
    const taggedContentItems = taggedContent.map((taggedItem, i) => {
      switch (taggedItem.type) {
        case USER:
          return (
            <UserListItem user={taggedItem.content}>
              <FollowUserButton targetUser={taggedItem.content} />
            </UserListItem>
          );

        case PUBLICATION:
          return <PublicationListItem publication={taggedItem.content} />;
        default:
          return null;
      }
    });
    return <div className="tagged-content-container">{taggedContentItems}</div>;
  }
}
