import React from 'react';
import Post from '../../../components/Posts/Post/Post';
import PostPageSider from './PostPageSider';
import {useParams, Link} from 'react-router-dom';
import {getTestPosts} from '../../../mockdata/posts';
import FilterableResults, {
  ResourceTabs,
  NewResultsWrapper,
} from '../../../components/FilterableResults/FilterableResults';
import postPageFeedData from './PostPageFeedData';
import publications from '../../../mockdata/publications';

import './PostPage.css';

export default function PostPage() {
  const thisPostID = useParams().postID;
  const slicedPostID = thisPostID.slice(0, thisPostID.length - 2);
  const matchedPost = getTestPosts().filter((post) =>
    post.id.includes(slicedPostID)
  )[0];

  const referencedResource = () => {
    const matchedResource = publications().filter(
      (publication) => publication.url === matchedPost.url
    )[0];
    if (matchedResource) {
      switch (matchedResource.resourceType) {
        case 'publication':
          return (
            <div className="post-page-resource-container">
              <p>Referenced Publication:</p>
              <Link to={`/publication/${matchedResource.id}`}>
                <h4 className="post-page-resource-link">
                  {matchedResource.title}
                </h4>
              </Link>
            </div>
          );
        default:
          return null;
      }
    }
    return null;
  };

  const siderTitleChoice = [
    'Other Posts from your Search',
    'Similar Posts to this one',
  ];

  const fetchResults = (skip, limit, filterOptions) =>
    postPageFeedData(skip, limit, filterOptions, matchedPost);

  const search = false;

  const relationshipFilter = [
    {
      collectionName: 'Relationship Types',
      options: [
        {
          enabled: false,
          data: {
            id: 'relatedPosts',
            name: 'Related Posts',
          },
        },
        {
          enabled: false,
          data: {
            id: 'relatedPublications',
            name: 'Related Publications',
          },
        },
        {
          enabled: false,
          data: {
            id: 'relatedUsers',
            name: 'Related Users',
          },
        },
        {
          enabled: false,
          data: {
            id: 'relatedGroups',
            name: 'Related Groups',
          },
        },
      ],

      mutable: false,
    },
  ];
  return (
    <>
      <div className="sider-layout">
        <div className="resource-sider">
          <h3 className="resource-sider-title">
            {search ? siderTitleChoice[0] : siderTitleChoice[1]}
          </h3>
          <div className="suggested-resources-container">
            <PostPageSider currentPost={matchedPost} />
          </div>
        </div>
      </div>
      <div className="content-layout">
        <div className="post-page-details-container">
          <Post post={matchedPost} dedicatedPage={true} />
          {referencedResource()}
        </div>
        <FilterableResults fetchResults={fetchResults} limit={10}>
          <div className="feed-container">
            <ResourceTabs tabs={relationshipFilter} />
            <NewResultsWrapper />
          </div>
        </FilterableResults>
      </div>
    </>
  );
}
