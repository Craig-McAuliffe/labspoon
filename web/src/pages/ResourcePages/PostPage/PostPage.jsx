import React, {useState, useEffect} from 'react';
import {db} from '../../../firebase';
import Post from '../../../components/Posts/Post/Post';
import {Redirect, useParams, useRouteMatch} from 'react-router-dom';
import {UnpaddedPageContainer} from '../../../components/Layout/Content';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';

import './PostPage.css';

export default function PostPage() {
  const postID = useParams().postID;
  const [post, setPost] = useState();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const route = useRouteMatch();

  useEffect(() => {
    setLoading(true);
    db.doc(`posts/${postID}`)
      .get()
      .then((postData) => {
        if (!postData.exists) {
          setNotFound(true);
          return;
        }
        const post = postData.data();
        post.id = postData.id;
        setPost(post);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, [postID, route]);

  if (notFound) return <Redirect to={'/notfound'} />;

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <UnpaddedPageContainer>
        <Post post={post} dedicatedPage={true} />
      </UnpaddedPageContainer>
    </>
  );
}
