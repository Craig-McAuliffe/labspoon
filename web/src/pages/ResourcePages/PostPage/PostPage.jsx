import React from 'react';
import Post from '../../../components/Posts/Post/Post';
import PostPageSider from './PostPageSider';
import {useParams} from 'react-router-dom';
import {getTestPosts} from '../../../mockdata/posts';
import FilterableResults from '../../../components/FilterableResults/FilterableResults';
import postPageFeedData from './PostPageFeedData';

export default function PostPage() {
  const thisPostID = useParams().postId;
  const slicedPostID = thisPostID.slice(0, thisPostID.length - 2);
  const matchedPost = getTestPosts().filter((post) =>
    post.id.includes(slicedPostID)
  )[0];

  const siderTitleChoice = [
    'Other Posts from your Search',
    'Similar Posts to this one',
  ];

  const fetchResults = (skip, limit, filterOptions) =>
    postPageFeedData(skip, limit, filterOptions, matchedPost);

  const search = false;
  const postDetails = () => <Post post={matchedPost} dedicatedPage={true} />;

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
  const getDefaultFilter = () => relationshipFilter;
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
        <div className="details-container">{postDetails()}</div>

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
