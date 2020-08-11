import {v4 as uuid} from 'uuid';

import {getFilterCollectionEnabledIDsSet} from '../components/Filter/Filter';

import {getTestPosts} from './posts';
import {getTypesFilterOptions} from './types';

function getBookmarks() {
  const posts = getTestPosts('1');
  return posts.map((post) => ({
    'id': uuid(),
    'type': 'bookmark',
    'resource': post,
  }));
}

export function getBookmarkFilters(bookmarks) {
  const filters = [
    {
      collectionName: 'Types',
      options: [
        {
          enabled: true,
          data: {
            id: 'bookmarks',
            name: 'Bookmarks',
          },
        },
      ],
      mutable: false,
    },
    getTypesFilterOptions(),
  ];
  filters[1].mutable = true;
  filters[1].collectionName = 'Content Type';
  return filters;
}

export function getFilteredBookmarks(filters) {
  let bookmarks = getBookmarks();
  filters.forEach((filterCollection) => {
    const enabledIDs = getFilterCollectionEnabledIDsSet(filterCollection);
    if (enabledIDs.size === 0) return;
    switch (filterCollection.collectionName) {
      case 'Content Type':
        bookmarks = bookmarks.filter(
            (bookmark) => enabledIDs.has(bookmark.resource.type),
        );
        break;
      default:
        break;
    }
  });
  return bookmarks;
}

