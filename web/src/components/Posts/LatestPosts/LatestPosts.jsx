import React, {useState, useEffect} from 'react';
import {db} from '../../../firebase';
import {postsQSToJSPosts} from '../../../helpers/posts';
import Post from '../Post/Post';
import LoadingSpinner from '../../LoadingSpinner/LoadingSpinner';

import './LatestPosts.css';

// A collection of the latest posts on Labspoon to show the user when a feed or
// search returns empty.
export default function LatestPosts() {
  const [posts, setPosts] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.collection('posts')
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get()
      .then((qs) => {
        setPosts(postsQSToJSPosts(qs));
        setLoading(false);
      })
      .catch((err) => alert(err));
  });

  if (!posts) return <></>;

  const postsList = posts.map((post) => <Post post={post} key={post.id} />);
  return (
    <div className="suggested-posts-container">
      <h2 className="suggested-posts-header">
        We think you&rsquo;ll find these posts interesting
      </h2>
      {loading ? <LoadingSpinner /> : postsList}
    </div>
  );
}
