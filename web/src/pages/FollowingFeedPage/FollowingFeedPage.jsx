import React, {useReducer, useState} from 'react';

import FilterableResults from '../../components/FilterableResults/FilterableResults';
import PostList from '../../components/Posts/PostList/PostList';
import {
  FilterMenu, getFilterCollectionEnabledIDsSet
} from '../../components/Filter/Filter';
import Sider from '../../components/Layout/Sider/Sider';

const patrickData = {
  'name': 'Patrick Leask',
  'id': '283h8wef8shef',
  'avatar': 'https://i.picsum.photos/id/804/200/200.jpg?hmac=73qw3Bnt67aOsdWd033BvfX9Gq0gIJ6FSL3Dp3gA97E',
};

const craigData = {
  'name': 'Craig McAuliffe',
  'id': 'QlnBFXHK0SDe5o7B85DMYehiO7H',
  'avatar': 'https://i.picsum.photos/id/620/200/200.jpg?hmac=i-QlnBFXHK0SDe5o7B85DMYehiO7H-fZxsKLRrfFCcU',
};

const biologyData = {
  'id': 'slkdfjsfioef',
  'name': 'Biology',
};

const physicsData = {
  'id': '283oiwef',
  'name': 'Physics',
};

const astronomyData = {
  'id': '083iSDfjkdl',
  'name': 'Astronomy',
};

const statisticsData = {
  'id': '*E0we8hfsenf',
  'name': 'Statistics',
};

const mathematicsData = {
  'id': '_(3rh3ir',
  'name': 'Mathematics',
};

const textTypeData = {id: 'text', name: 'text'};
const publicationTypeData = {id: 'publication', name: 'publication'};
const newsTypeData = {id: 'news', name: 'news'};

/**
 * Gets an array of test post data
 * @param {number} i - index of the test results, used for differentiating IDs
 * @return {Object}
 */
function getTestPosts(i) {
  return [
    {
      'id': 'o3bosfseself' + i,
      'title': 'The National Lung Matrix Trial of personalized therapy in' +
            'lung cancer ',
      'type': textTypeData,
      'author': patrickData,
      'content': {
        'text': 'This is an example of a text post!',
      },
      'topics': [
        biologyData,
        physicsData,
      ],
    },
    {
      'id': '83hisefoi' + i,
      'title': 'Today I overslept',
      'type': publicationTypeData,
      'author': craigData,
      'content': {
        'text': 'It was so crazy I woke up at like 8.30 I mean what the fuck',
      },
      'topics': [
        astronomyData,
        physicsData,
      ],
    },
    {
      'id': '09w03rin' + i,
      'title': 'I hate coming up with test data',
      'type': newsTypeData,
      'author': patrickData,
      'content': {
        'text': 'It&apos;s literally the fucking worst thing ever',
      },
      'topics': [
        statisticsData,
        mathematicsData,
      ],
    },
  ];
}

const peopleFilterData = {
  collectionName: 'People',
  options: [
    {
      enabled: false,
      data: patrickData,
    },
    {
      enabled: false,
      data: craigData,
    },
  ],
};

const topicFilterData = {
  collectionName: 'Topics',
  options: [
    {
      enabled: false,
      data: biologyData,
    },
    {
      enabled: false,
      data: physicsData,
    },
    {
      enabled: false,
      data: astronomyData,
    },
    {
      enabled: false,
      data: statisticsData,
    },
    {
      enabled: false,
      data: mathematicsData,
    },
  ],
};

const typesFilterData = {
  collectionName: 'Types',
  options: [
    {
      enabled: false,
      data: textTypeData,
    }, {
      enabled: false,
      data: publicationTypeData,
    }, {
      enabled: false,
      data: newsTypeData,
    },
  ],
};

const filterOptionsData = [
  peopleFilterData,
  topicFilterData,
  typesFilterData,
];

/**
 * Fetches test data applying pagination and a filter
 * This will be replaced by API calls
 * @param {number} skip - number of results to skip
 * @param {number} limit - number of results to return
 * @param {Array} filter - filter to apply to results, see FeedPage
 * documentation
 * @return {Array}
*/
function fetchFeedData(skip, limit, filter) {
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
      case 'Types':
        repeatedTestPosts = repeatedTestPosts.filter(
            (post) => enabledIDs.has(post.type.id),
        );
        break;
      default:
        break;
    }
  });
  return repeatedTestPosts.slice(skip, skip + limit);
}

/**
 * Renders the feed page, which contains both a feed and a filter menu
 * @return {React.ReactElement}
 */
export default function FollowingFeedPage() {
  return (
    <FilterableResults
      DisplayComponent={FeedComp}
      fetchResults={fetchFeedData}
      defaultFilter={filterOptionsData}
      limit={5}
    />
  );
}

function FeedComp({results, hasMore, fetchMore, filterOptions, updateFilterOption}) {
  return (
    <>
      <div className="Sider">
        <Sider>
          <FilterMenu
            options={filterOptions}
            updateFilterOption={updateFilterOption}
          />
        </Sider>
      </div>
      <div className="Content">
        <PostList
          results={results}
          hasMore={hasMore}
          fetchMore={fetchMore}
        />
      </div>
    </>
  );
}
