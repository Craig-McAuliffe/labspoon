import React from 'react';

import {GenericListItem} from '../../Results/Results';

export default function BookmarkListItem({bookmark}) {
  return (
    <div className="bookmark-list-item">
      <GenericListItem
        result={bookmark.bookmarkedResourceData}
        onBookmarkPage={true}
      />
    </div>
  );
}
