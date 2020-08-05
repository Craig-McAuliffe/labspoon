import postTypes from './postTypes';

function peopleFilter(posts) {
  let seenIDs = new Set()
  let options = [];
  posts.forEach((post) => {
    if (seenIDs.has(post.author.id)) return;
    seenIDs.add(post.author.id);
    options.push(
      {
        enabled: false,
        data: post.author,
      }
    );
  });
  return {
    collectionName: 'People',
    options: options,
  };
}

function topicFilter(posts) {
  let seenIDs = new Set();
  let options = [];
  posts.forEach((post) => {
    post.topics.forEach((topic) => {
      if (seenIDs.has(topic.id)) return;
      seenIDs.add(topic.id);
      options.push({
        enabled: false,
        data: topic
      });
    });
  });
  return {
    collectionName: 'Topics',
    options: options,
  };
}

function typesFilter() {
  let options = postTypes().map((postType) => ({
    enabled: false,
    data: postType,
  }));
  return {
    collectionName: 'Types',
    options: options,
  };
}

export default function filters(posts) {
  return [
    peopleFilter(posts),
    topicFilter(posts),
    typesFilter(),
  ];
}
