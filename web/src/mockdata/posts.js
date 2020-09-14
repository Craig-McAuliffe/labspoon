import {getFilterCollectionEnabledIDsSet} from '../components/Filter/Filter';

import postTypes from './postTypes';
import topics from './topics';
import users from './users';
import publications from './publications';

export function getTestPosts(uniqueID) {
  return [
    {
      id: 'o3bosfseself' + uniqueID,
      resourceType: 'post',
      title:
        'Possible reason for the long term infections of some COVID patients',
      postType: postTypes()[0],
      generated: false,
      author: users()[0],
      createdAt: 'July 15, 2020 09:35:32',
      content: {
        text:
          'After reading a few publications on the matter, I think the tendency' +
          'for some people to develop long-lasting symptoms from SARS-CoV2 stems from the' +
          'B149a gene (T Cell innate immunity)',
      },
      topics: [topics()[0], topics()[1]],
      optionaltags: [],
    },
    {
      id: '83hisefoi' + uniqueID,
      resourceType: 'post',
      title:
        'The National Lung Matrix Trial of personalized therapy in' +
        'lung cancer ',
      postType: postTypes()[1],
      generated: false,
      author: users()[1],
      createdAt: 'July 15, 2020 09:35:32',
      url: 'https://www.nature.com/articles/s41467-020-17708-1',
      content: {
        text: 'We wrote a paper on personalised therapy in lung cancer',
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
      resourceType: 'post',
      title:
        'Interview with BBC news on the consequences of air pollution for brain development',
      postType: postTypes()[2],
      generated: false,
      author: users()[3],
      createdAt: 'July 15, 2020 09:35:32',
      content: {
        text: 'I was interviewed for BBC news!',
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
      resourceType: 'post',
      title: 'This new publication is relevant to you.',
      author: users()[9],
      createdAt: 'July 15, 2020 09:35:32',
      content: {
        text: '',
      },
      type: postTypes()[1],
      postType: postTypes()[1],
      generated: true,
      topics: [topics()[3], topics()[5]],
      referencedResource: publications()[0],
    },
    {
      id: 'fdjsi93uhifh' + uniqueID,
      resourceType: 'post',
      title: 'New publication for you!',
      author: users()[9],
      createdAt: 'July 15, 2020 09:35:32',
      content: {
        text: '',
      },
      type: postTypes()[1],
      postType: postTypes()[1],
      generated: true,
      topics: [topics()[3], topics()[4]],
      referencedResource: publications()[1],
    },
    {
      id: 'f8d9hu34huhfui' + uniqueID,
      resourceType: 'post',
      author: users()[9],
      createdAt: 'July 15, 2020 09:35:32',
      title: 'This publication just came out!',
      content: {
        text: '',
      },
      type: postTypes()[1],
      postType: postTypes()[1],
      generated: true,
      topics: [topics()[3], topics()[4]],
      referencedResource: publications()[2],
    },
    {
      id: '3829huoewrn' + uniqueID,
      resourceType: 'post',
      title: 'Another new publication for you!',
      author: users()[9],
      createdAt: 'July 15, 2020 09:35:32',
      content: {
        text: '',
      },
      type: postTypes()[1],
      postType: postTypes()[1],
      generated: true,
      topics: [topics()[3], topics()[4]],
      referencedResource: publications()[3],
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
          enabledIDs.has(post.postType.id)
        );
        break;
      default:
        break;
    }
  });
  return repeatedTestPosts;
}
