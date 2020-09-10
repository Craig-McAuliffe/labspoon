import React, {useContext, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {FeatureFlags} from '../../App';
import {db} from '../../firebase';

import {getActiveTabID} from '../../helpers/filters';
import {getPaginatedPostsFromCollectionRef} from '../../helpers/posts';
import {getPaginatedUserReferencesFromCollectionRef} from '../../helpers/users';

import TopicListItem from '../../components/Topics/TopicListItem';
import topics from '../../mockdata/topics';
import FilterableResults from '../../components/FilterableResults/FilterableResults';
import topicPageFeedData from './TopicPageFeedData';
import TopicPageSider from './TopicPageSider';

import './TopicPage.css';

function fetchTopicDetailsFromDB(topicID) {
  return db
    .doc(`topics/${topicID}`)
    .get()
    .then((topicDetails) => topicDetails.data())
    .catch((err) => console.log(err));
}

function topicPageFeedDataFromDB(skip, limit, filterOptions, topicID, last) {
  const activeTab = getActiveTabID(filterOptions);
  let results = [];
  switch (activeTab) {
    case 'posts':
      const postsCollection = db.collection(`topics/${topicID}/posts`);
      return getPaginatedPostsFromCollectionRef(postsCollection, limit, last);
    case 'publications':
      results = [];
      break;
    case 'researchers':
      const usersCollection = db.collection(`topics/${topicID}/users`);
      return getPaginatedUserReferencesFromCollectionRef(
        usersCollection,
        limit,
        last
      );
    case 'groups':
      results = [];
      break;
    case 'overview':
      results = [];
      break;
  }
  return results;
}

export default function TopicPage() {
  const featureFlags = useContext(FeatureFlags);
  const [topicID, setTopicID] = useState(undefined);
  const [topicDetails, setTopicDetails] = useState(undefined);

  const topicIDParam = useParams().topicID;
  if (topicID !== topicIDParam) {
    setTopicID(topicIDParam);
  }

  let fetchTopicDetails;
  if (featureFlags.has('cloud-firestore')) {
    fetchTopicDetails = () => fetchTopicDetailsFromDB(topicID);
  } else {
    fetchTopicDetails = () =>
      topics().filter((topic) => topic.id === topicID)[0];
  }

  useEffect(() => {
    Promise.resolve(fetchTopicDetails())
      .then((topicDetails) => {
        setTopicDetails(topicDetails);
      })
      .catch((err) => console.log(err));
  }, [topicID]);

  const search = false;

  let fetchFeedData;
  if (featureFlags.has('cloud-firestore')) {
    fetchFeedData = (skip, limit, filterOptions, last) =>
      topicPageFeedDataFromDB(skip, limit, filterOptions, topicID, last);
  } else {
    fetchFeedData = (skip, limit, filterOptions, last) =>
      topicPageFeedData(skip, limit, filterOptions, topicDetails, last);
  }

  const siderTitleChoice = [
    'Other Topics from your Search',
    'Similar Topics to this one',
  ];

  const relationshipFilter = [
    {
      collectionName: 'Relationship Types',
      options: [
        {
          enabled: false,
          data: {
            id: 'posts',
            name: 'Posts',
          },
        },
        {
          enabled: false,
          data: {
            id: 'publications',
            name: 'Publications',
          },
        },
        {
          enabled: false,
          data: {
            id: 'researchers',
            name: 'Researchers',
          },
        },
        {
          enabled: false,
          data: {
            id: 'groups',
            name: 'Groups',
          },
        },
      ],

      mutable: false,
    },
  ];

  if (featureFlags.has('overview')) {
    relationshipFilter[0].options.push({
      enabled: false,
      data: {
        id: 'overview',
        name: 'Overview',
      },
    });
  }

  const getDefaultFilter = () => relationshipFilter;

  return (
    <>
      <div className="sider-layout">
        <div className="resource-sider">
          <h3 className="resource-sider-title">
            {search ? siderTitleChoice[0] : siderTitleChoice[1]}
          </h3>
          <div className="suggested-resources-container">
            <TopicPageSider currentTopic={topicDetails} />
          </div>
        </div>
      </div>
      <div className="content-layout">
        <div className="details-container">
          <TopicListItem topic={topicDetails} dedicatedPage={true} />
        </div>
        <FilterableResults
          fetchResults={fetchFeedData}
          getDefaultFilter={getDefaultFilter}
          limit={10}
          useTabs={true}
          useFilterSider={false}
        />
      </div>
    </>
  );
}
