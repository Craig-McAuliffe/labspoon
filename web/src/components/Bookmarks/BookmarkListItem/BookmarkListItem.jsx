import React from 'react';

import {GenericListItem} from '../../Results/Results';
import BookmarkButton from '../../Buttons/BookmarkButton';

export default function BookmarkListItem({bookmark}) {
  return (
    <div className="bookmark-list-item">
      <BookmarkButton />
      <GenericListItem result={bookmark.resource} />
    </div>
  );
}
