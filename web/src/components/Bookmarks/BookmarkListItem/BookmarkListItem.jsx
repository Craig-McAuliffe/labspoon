import React from 'react';

import {GenericListItem} from '../../Results/Results';

export default function BookmarkListItem({bookmark}) {
  const bookmarkedResource = bookmark.bookmarkedResourceData;
  bookmarkedResource.resourceType = bookmark.bookmarkedResourceType;
  return (
    <div className="bookmark-list-item">
      <GenericListItem result={bookmarkedResource} />
    </div>
  );
}
