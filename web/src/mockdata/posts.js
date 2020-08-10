import postTypes from './postTypes';
import topics from './topics';
import users from './users';

export default function getTestPosts(uniqueID) {
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
      id: '0b7sya8' + uniqueID,
      category: 'resource',
      title: 'This is the title from the publication',
      type: postTypes()[1],
      author: users()[2],
      journal: 'Journal Name',
      content: {
        abstract:
          'This is the abstract that we have automatically captured from the publication which is stored somewhere in the internet. It is rather cool is it not? Yes indeed it is. What are we talking about? Science. What type of science? You wouldnt understand, it is the science of the gods.',
        authors: 'Bobby McGee, Sally McDee, Joshua McLee, Xi McSee',
      },
      topics: [topics()[3], topics()[4]],
      optionaltags: [],
    },
  ];
}
