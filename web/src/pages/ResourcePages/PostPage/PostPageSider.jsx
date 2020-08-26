import React from 'react';
import {getTestPosts} from '../../../mockdata/posts';
import {Link} from 'react-router-dom';

import './PostPage.css';

export default function PostPageSider({currentPost}) {
  const search = false;

  const topicIDs = currentPost.topics.map((topic) => topic.id).slice(0, 2);

  const similarPosts = () => {
    const similarPostSet = [];

    topicIDs.forEach((topicID) => {
      getTestPosts().forEach((post) => {
        if (
          post.topics.some((relatedTopic) => relatedTopic.id === topicID) &&
          !similarPostSet.some((matchedPost) => matchedPost.id === post.id)
        )
          similarPostSet.push(post);
      });
    });

    return similarPostSet.map((post) => (
      <div className="suggested-post" key={post.id}>
        <Link to={`/post/${post.id}`}>{post.title}</Link>
      </div>
    ));
  };

  const fromContextPosts = () => <p>Other posts from search</p>;

  return search ? fromContextPosts() : similarPosts();
}
