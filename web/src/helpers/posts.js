// Retrieves paginated posts from the passed post collection using the last
// post of the previous page as a cursor. Returns a promise that returns an
// array of results when resolved. If there are no results, or the collection

import {
  DEFAULT_POST_NAME,
  EVENT_POST_NAME,
  IDEA_POST_NAME,
  OPEN_POSITION_POST_NAME,
  PROJECT_GRANT_POST_NAME,
  PUBLICATION_POST_NAME,
  QUESTION_POST_NAME,
  SUB_TOPIC_POST_NAME,
} from '../components/Posts/Post/CreatePost/CreatePost';
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

export function postTypeNameToNameAndID(postTypeName) {
  switch (postTypeName) {
    case DEFAULT_POST_NAME:
      return {
        name: 'Default',
        id: 'defaultPost',
      };
    case EVENT_POST_NAME:
      return {
        name: 'Event',
        id: 'eventPost',
      };
    case OPEN_POSITION_POST_NAME:
      return {
        id: 'openPositionPost',
        name: 'Open Position',
      };
    case PUBLICATION_POST_NAME:
      return {
        id: 'publicationPost',
        name: 'Publication',
      };
    case PROJECT_GRANT_POST_NAME:
      return {
        name: 'Project / Grant',
        id: 'projectGrantPost',
      };
    case QUESTION_POST_NAME:
      return {
        name: 'Question',
        id: 'questionPost',
      };
    case IDEA_POST_NAME:
      return {
        name: 'Idea',
        id: 'ideaPost',
      };
    case SUB_TOPIC_POST_NAME:
      return {
        name: 'Sub Topic',
        id: 'subTopicPost',
      };
    default:
      return {
        name: 'Default',
        id: 'defaultPost',
      };
  }
}
