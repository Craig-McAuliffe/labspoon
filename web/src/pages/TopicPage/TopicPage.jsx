import React from 'react';
import {useParams} from 'react-router-dom';

import TopicListItem from '../../components/Topics/TopicListItem';
import topics from '../../mockdata/topics';
import FilterableResults from '../../components/FilterableResults/FilterableResults';
import topicPageFeedData from './TopicPageFeedData';
import TopicPageSider from './TopicPageSider';

import './TopicPage.css';

export default function TopicPage() {
  const topicID = useParams().topicID;
  const matchedTopic = topics().filter((topic) => topic.id === topicID)[0];

  const search = false;

  const siderTitleChoice = [
    'Other Topics from your Search',
    'Similar Topics to this one',
  ];

  const fetchResults = (skip, limit, filterOptions) =>
    topicPageFeedData(skip, limit, filterOptions, matchedTopic);

  const relationshipFilter = [
    {
      collectionName: 'Relationship Types',
      options: [
        {
          enabled: false,
          data: {
            id: 'mostRelevant',
            name: 'Most Relevant',
          },
        },
        {
          enabled: false,
          data: {
            id: 'post',
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

  const getDefaultFilter = () => relationshipFilter;

  return (
    <>
      <div className="sider-layout">
        <div className="resource-sider">
          <h3 className="resource-sider-title">
            {search ? siderTitleChoice[0] : siderTitleChoice[1]}
          </h3>
          <div className="suggested-resources-container">
            <TopicPageSider currentTopic={matchedTopic} />
          </div>
        </div>
      </div>
      <div className="content-layout">
        <div className="details-container">
          <TopicListItem topic={matchedTopic} dedicatedPage={true} />
        </div>

        <FilterableResults
          fetchResults={fetchResults}
          getDefaultFilter={getDefaultFilter}
          limit={10}
          useTabs={true}
          useFilterSider={false}
        />
      </div>
    </>
  );
}
