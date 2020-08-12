import {getFilterCollectionEnabledIDsSet} from '../components/Filter/Filter';

import postTypes from './postTypes';
import topics from './topics';
import users from './users';

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
      id: '0b7sya8' + uniqueID,
      category: 'resource',
      title:
        'SARS-CoV-2 neutralization and serology testing of COVID-19 convalescent plasma from donors with non-severe disease',
      type: postTypes()[1],
      author: users()[2],
      url: 'https://www.nature.com/articles/s41467-020-17708-1',
      content: {
        abstract:
          'Aging is an inevitable course of life. Additionally, the risk of chronic diseases or cancer increases with age. The comprehensive identification of signs related to aging can be beneficial for the prevention and early diagnosis of geriatric diseases. The comparison of global modifications in the urine proteome is a means of multidimensional information mining. This approach is based on urine, in which changes from whole-body metabolism can accumulate. This study used the urine of healthy people at different ages (22 children, 10 young people, 6 senior people) as the research object and using high-resolution tandem mass spectrometry, label-free quantitation combined with non-limiting modification identification algorithms and random group test, compared the differences in protein chemical modifications among three groups. The results show that multi-sites oxidative modifications and amino acid substitutions are noticeable features that distinguish these three age groups of people. The proportion of multi-site oxidations in urine proteins of senior (29.76%) is significantly higher than the young group (13.71% and 12.97%), which affect the biological processes of various proteins. This study could provide a reference for studies of aging mechanisms and biomarkers of age-related disease.',
        authors: [
          'Bobby McGee',
          'Sally McDee',
          'Joshua McLee',
          'Xi McSee',
          'Flee McWee',
          'Cecelia McThee',
          'Charly McVee',
        ],
      },
      topics: [topics()[5]],
      optionaltags: [],
    },
    {
      id: '890dsj57f' + uniqueID,
      category: 'resource',
      title: 'This is a non COVID publication.',
      type: postTypes()[1],
      author: users()[2],
      url: 'https://www.nature.com/articles/s41467-020-17708-1',
      content: {
        abstract:
          'Aging is an inevitable course of life. Additionally, the risk of chronic diseases or cancer increases with age. The comprehensive identification of signs related to aging can be beneficial for the prevention and early diagnosis of geriatric diseases. The comparison of global modifications in the urine proteome is a means of multidimensional information mining. This approach is based on urine, in which changes from whole-body metabolism can accumulate. This study used the urine of healthy people at different ages (22 children, 10 young people, 6 senior people) as the research object and using high-resolution tandem mass spectrometry, label-free quantitation combined with non-limiting modification identification algorithms and random group test, compared the differences in protein chemical modifications among three groups. The results show that multi-sites oxidative modifications and amino acid substitutions are noticeable features that distinguish these three age groups of people. The proportion of multi-site oxidations in urine proteins of senior (29.76%) is significantly higher than the young group (13.71% and 12.97%), which affect the biological processes of various proteins. This study could provide a reference for studies of aging mechanisms and biomarkers of age-related disease.',
        authors: [
          'Bobby McGee',
          'Sally McDee',
          'Joshua McLee',
          'Xi McSee',
          'Flee McWee',
          'Cecelia McThee',
          'Charly McVee',
        ],
      },
      topics: [topics()[3], topics()[4]],
      optionaltags: [],
    },
    {
      id: '34ufihsd8' + uniqueID,
      category: 'resource',
      title: 'SARS CoV-2 RNA vaccine phase-2 clinical trial results',
      type: postTypes()[1],
      author: users()[2],
      url: 'https://www.nature.com/articles/s41467-020-17708-1',
      content: {
        abstract:
          'Aging is an inevitable course of life. Additionally, the risk of chronic diseases or cancer increases with age. The comprehensive identification of signs related to aging can be beneficial for the prevention and early diagnosis of geriatric diseases. The comparison of global modifications in the urine proteome is a means of multidimensional information mining. This approach is based on urine, in which changes from whole-body metabolism can accumulate. This study used the urine of healthy people at different ages (22 children, 10 young people, 6 senior people) as the research object and using high-resolution tandem mass spectrometry, label-free quantitation combined with non-limiting modification identification algorithms and random group test, compared the differences in protein chemical modifications among three groups. The results show that multi-sites oxidative modifications and amino acid substitutions are noticeable features that distinguish these three age groups of people. The proportion of multi-site oxidations in urine proteins of senior (29.76%) is significantly higher than the young group (13.71% and 12.97%), which affect the biological processes of various proteins. This study could provide a reference for studies of aging mechanisms and biomarkers of age-related disease.',
        authors: [
          'Bobby McGee',
          'Sally McDee',
          'Joshua McLee',
          'Xi McSee',
          'Flee McWee',
          'Cecelia McThee',
          'Charly McVee',
        ],
      },
      topics: [topics()[5]],
      optionaltags: [],
    },
    {
      id: '48df92rh297f' + uniqueID,
      category: 'resource',
      title:
        'SARS CoV-2 innate T Cell overreaction and chronic inflammation as explanation for male and age-related vulnerability.',
      type: postTypes()[1],
      author: users()[2],
      url: 'https://www.nature.com/articles/s41467-020-17708-1',
      content: {
        abstract:
          'Aging is an inevitable course of life. Additionally, the risk of chronic diseases or cancer increases with age. The comprehensive identification of signs related to aging can be beneficial for the prevention and early diagnosis of geriatric diseases. The comparison of global modifications in the urine proteome is a means of multidimensional information mining. This approach is based on urine, in which changes from whole-body metabolism can accumulate. This study used the urine of healthy people at different ages (22 children, 10 young people, 6 senior people) as the research object and using high-resolution tandem mass spectrometry, label-free quantitation combined with non-limiting modification identification algorithms and random group test, compared the differences in protein chemical modifications among three groups. The results show that multi-sites oxidative modifications and amino acid substitutions are noticeable features that distinguish these three age groups of people. The proportion of multi-site oxidations in urine proteins of senior (29.76%) is significantly higher than the young group (13.71% and 12.97%), which affect the biological processes of various proteins. This study could provide a reference for studies of aging mechanisms and biomarkers of age-related disease.',
        authors: [
          'Bobby McGee',
          'Sally McDee',
          'Joshua McLee',
          'Xi McSee',
          'Flee McWee',
          'Cecelia McThee',
          'Charly McVee',
        ],
      },
      topics: [topics()[5]],
      optionaltags: [],
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
