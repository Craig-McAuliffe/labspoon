import React from 'react';

import {ListItem} from '../../Results/Results';
import BookmarkButton from  '../../Buttons/BookmarkButton';

export default function BookmarkListItem({bookmark}) {
  return (
    <div className='bookmark-list-item'>
      <BookmarkButton />
      <ListItem result={bookmark.resource} />
    </div>
  );
};


