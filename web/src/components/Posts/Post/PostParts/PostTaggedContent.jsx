import React from 'react';
import {useLocation} from 'react-router';
import {
  OPENPOSITION,
  PUBLICATION,
  USER,
} from '../../../../helpers/resourceTypeDefinitions';
import {ReducedOpenPositionListItem} from '../../../OpenPosition/OpenPositionListItem';
import PublicationListItem from '../../../Publication/PublicationListItem';
import FollowUserButton from '../../../User/FollowUserButton/FollowUserButton';
import UserListItem from '../../../User/UserListItem';

import './PostTaggedContent.css';

export default function PostOptionalTags({backgroundShade, taggedContent}) {
  if (!taggedContent || taggedContent.length === 0) return null;
  const locationPathname = useLocation().pathname;
  const taggedContentItems = taggedContent.map((taggedItem, i) => {
    switch (taggedItem.type) {
      case USER:
        return (
          <UserListItem user={taggedItem.content} key={(taggedItem.id, i)}>
            <FollowUserButton
              backgroundShade={backgroundShade}
              targetUser={taggedItem.content}
            />
          </UserListItem>
        );
      case PUBLICATION:
        if (locationPathname.includes(PUBLICATION)) return null;
        const taggedPublication = taggedItem.content;
        taggedPublication.backgroundShade = backgroundShade;
        return (
          <PublicationListItem
            publication={taggedPublication}
            key={(taggedItem.id, i)}
            onPost={true}
          />
        );
      case OPENPOSITION:
        if (locationPathname.includes(OPENPOSITION)) return null;
        const taggedOpenPosition = taggedItem.content;
        taggedOpenPosition.backgroundShade = backgroundShade;
        return (
          <ReducedOpenPositionListItem
            openPosition={taggedOpenPosition}
            key={(taggedItem.id, i)}
          />
        );
      default:
        return null;
    }
  });
  return <div className="tagged-content-container">{taggedContentItems}</div>;
}
