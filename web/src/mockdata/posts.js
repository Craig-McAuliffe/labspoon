import {getFilterCollectionEnabledIDsSet} from '../components/Filter/Filter';

import postTypes from './postTypes';
import topics from './topics';
import users from './users';

function getTestPosts(uniqueID) {
  return [
    {
      'id': 'o3bosfseself' + uniqueID,
      'title': 'The National Lung Matrix Trial of personalized therapy in' +
            'lung cancer ',
      'type': postTypes()[0],
      'author': users()[0],
      'content': {
        'text': 'This is an example of a text post!',
      },
      'topics': [
        topics()[0],
        topics()[1],
      ],
    },
    {
      'id': '83hisefoi' + uniqueID,
      'title': 'Today I overslept',
      'type': postTypes()[1],
      'author': users()[1],
      'content': {
        'text': 'It was so crazy I woke up at like 8.30 I mean what the fuck',
      },
      'topics': [
        topics()[2],
        topics()[1],
      ],
    },
    {
      'id': '09w03rin' + uniqueID,
      'title': 'I hate coming up with test data',
      'type': postTypes()[2],
      'author': users()[0],
      'content': {
        'text': 'It&apos;s literally the fucking worst thing ever',
      },
      'topics': [
        topics()[3],
        topics()[4],
      ],
    },
  ];
}

export default function getFilteredPosts(filter) {
  let repeatedTestPosts = [];
  for (let i = 0; i < 10; i++) {
    repeatedTestPosts = repeatedTestPosts.concat(getTestPosts(i));
  }
  filter.forEach((filterCollection) => {
    const enabledIDs = getFilterCollectionEnabledIDsSet(filterCollection);
    if (enabledIDs.size === 0) return;
    switch (filterCollection.collectionName) {
      case 'People':
        repeatedTestPosts = repeatedTestPosts.filter(
            (post) => enabledIDs.has(post.author.id),
        );
        break;
      case 'Topics':
        repeatedTestPosts = repeatedTestPosts.filter(
            (post) => post.topics.some((topic) => enabledIDs.has(topic.id)),
        );
        break;
      case 'Post Types':
        repeatedTestPosts = repeatedTestPosts.filter(
            (post) => enabledIDs.has(post.type.id),
        );
        break;
      default:
        break;
    }
  });
  return repeatedTestPosts;
}
