import {getFilterCollectionEnabledIDsSet} from '../components/Filter/Filter';

import postTypes from './postTypes';
import resourceTypes from './resourceTypes';
import topics from './topics';
import users from './users';
import publications from './publications';

function getTestPosts(uniqueID) {
  return [
    {
      id: 'o3bosfseself' + uniqueID,
      category: 'post',
      title:
        'The National Lung Matrix Trial of personalized therapy in' +
        'lung cancer ',
      type: postTypes()[0],
      author: users()[0],
      content: {
        text: 'This is an example of a text post!',
      },
      topics: [topics()[0], topics()[1]],
      optionaltags: [],
    },
    {
      id: '83hisefoi' + uniqueID,
      category: 'post',
      title: 'Today I overslept',
      type: postTypes()[1],
      author: users()[1],
      content: {
        text: 'It was so crazy I woke up at like 8.30 I mean what the fuck',
      },
      topics: [topics()[2], topics()[1]],
      optionaltags: [
        {
          type: 'location',
          content: 'London, United Kingdom',
        },
        {
          type: 'methods',
          content: 'Microsoft Excel',
        },
        {
          type: 'start date',
          content: '2nd January 2021',
        },
        {
          type: 'salary',
          content: '£0.01',
        },
        {
          type: 'funder',
          content: 'GSK',
        },
        {
          type: 'amount',
          content: '$1 Billion',
        },
        {
          type: 'researcher',
          content: [
            {
              name: 'Craig McAuliffe',
              id: '57ajf92',
            },
            {
              name: 'Patrick Leask',
              id: 'yomamma',
            },
          ],
        },
      ],
    },
    {
      id: '09w03rin' + uniqueID,
      category: 'post',
      title: 'I hate coming up with test data',
      type: postTypes()[2],
      author: users()[0],
      content: {
        text: 'It&apos;s literally the fucking worst thing ever',
      },
      topics: [topics()[3], topics()[4]],
      optionaltags: [
        {
          type: 'researcher',
          content: [
            {
              name: 'Craig McAuliffe',
              id: '57ajf92',
            },
          ],
        },
      ],
    },
    {
      id: 'fdfd892hrn' + uniqueID,
      category: 'resource',
      author: users()[2],
      type: postTypes()[1],
      topics: [topics()[3], topics()[4]],
      resourceType: resourceTypes()[0],
      resource: publications()[0],
    },
    {
      id: 'fdjsi93uhifh' + uniqueID,
      category: 'resource',
      author: users()[2],
      type: postTypes()[1],
      topics: [topics()[3], topics()[4]],
      resourceType: resourceTypes()[0],
      resource: publications()[1],
    },
    {
      id: 'f8d9hu34huhfui' + uniqueID,
      category: 'resource',
      author: users()[2],
      type: postTypes()[1],
      topics: [topics()[3], topics()[4]],
      resourceType: resourceTypes()[0],
      resource: publications()[2],
    },
    {
      id: '3829huoewrn' + uniqueID,
      category: 'resource',
      author: users()[2],
      type: postTypes()[1],
      topics: [topics()[3], topics()[4]],
      resourceType: resourceTypes()[0],
      resource: publications()[3],
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
        repeatedTestPosts = repeatedTestPosts.filter((post) =>
          enabledIDs.has(post.author.id)
        );
        break;
      case 'Topics':
        repeatedTestPosts = repeatedTestPosts.filter((post) =>
          post.topics.some((topic) => enabledIDs.has(topic.id))
        );
        break;
      case 'Post Types':
        repeatedTestPosts = repeatedTestPosts.filter((post) =>
          enabledIDs.has(post.type.id)
        );
        break;
      default:
        break;
    }
  });
  return repeatedTestPosts;
}
