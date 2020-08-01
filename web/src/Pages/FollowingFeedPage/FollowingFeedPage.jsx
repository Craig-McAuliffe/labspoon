import React from 'react';

import PostList from '../../components/Posts/PostList/PostList';

import './FollowingFeedPage.css';

function FollowingFeedPage() {
  return (
    <div className="FeedContent">
      <PostList />
    </div>
  );
}

export default FollowingFeedPage;
