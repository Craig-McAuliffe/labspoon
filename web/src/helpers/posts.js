// Retrieves paginated posts from the passed post collection using the last
// post of the previous page as a cursor. Returns a promise that returns an
// array of results when resolved. If there are no results, or the collection

import {openPosToOpenPosListItem} from './openPositions';
import {publicationToPublicationListItem} from './publications';

// does not exist, an empty array of results is returned.
export function getPaginatedPostsFromCollectionRef(
  postCollection,
  limit,
  last
) {
  if (typeof last !== 'undefined') {
    postCollection = postCollection.startAt(last.timestamp);
  }
  return postCollection
    .limit(limit)
    .get()
    .then((qs) => postsQSToJSPosts(qs))
    .catch((err) => console.log(err));
}

export function postsQSToJSPosts(qs) {
  const posts = [];
  qs.forEach((doc) => {
    posts.push(postDSToJSPost(doc));
  });
  return posts;
}

function postDSToJSPost(ds) {
  const post = ds.data();
  post.resourceType = 'post';
  post.id = ds.id;
  return post;
}

export function getPostListItemFromPost(post) {
  const postRef = {
    postType: post.postType,
    author: post.author,
    text: post.text,
    topics: post.topics,
    timestamp: post.timestamp,
    filterTopicIDs: post.filterTopicIDs,
    unixTimeStamp: post.unixTimeStamp,
    id: post.id,
  };
  if (post.customTopics) postRef.customTopics = post.customTopics;
  if (post.publication)
    postRef.publication = publicationToPublicationListItem(
      post.publication,
      post.publication.id
    );
  if (post.openPosition)
    postRef.openPosition = openPosToOpenPosListItem(
      post.openPosition,
      post.openPosition.id
    );
  return postRef;
}
