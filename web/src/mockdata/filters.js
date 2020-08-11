import postTypes from './postTypes';

function getPeopleFilter(posts) {
  const seenIDs = new Set();
  const options = [];
  posts.forEach((post) => {
    if (seenIDs.has(post.author.id)) return;
    seenIDs.add(post.author.id);
    options.push({
      enabled: false,
      data: post.author,
    });
  });
  return {
    collectionName: 'People',
    options: options,
    mutable: true,
  };
}

function getTopicFilter(posts) {
  const seenIDs = new Set();
  const options = [];
  posts.forEach((post) => {
    post.topics.forEach((topic) => {
      if (seenIDs.has(topic.id)) return;
      seenIDs.add(topic.id);
      options.push({
        enabled: false,
        data: topic,
      });
    });
  });
  return {
    collectionName: 'Topics',
    options: options,
    mutable: true,
  };
}

function getPostTypesFilter() {
  const options = postTypes().map((postType) => ({
    enabled: false,
    data: postType,
  }));
  return {
    collectionName: 'Post Types',
    options: options,
    mutable: true,
  };
}

function getTypesFilter() {
  return {
    collectionName: 'Types',
    options: [
      {
        enabled: false,
        data: {
          id: 'posts',
          name: 'Posts',
        },
      },
    ],
    mutable: false,
  };
}

function getTypesFilterForPostsList() {
  return {
    collectionName: 'Types',
    options: [
      {
        enabled: true,
        data: {
          id: 'posts',
          name: 'Posts',
        },
      },
    ],
    mutable: false,
  };
}

export function getPostFilters(posts) {
  return [
    getTypesFilterForPostsList(),
    getPeopleFilter(posts),
    getTopicFilter(posts),
    getPostTypesFilter(),
  ];
}

export function getSearchFilters() {
  return [
    getTypesFilter(),
    getPostTypesFilter(),
  ];
}
