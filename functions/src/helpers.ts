import {Post} from './posts';
import {ResourceTypes, ResourceTypesCollections} from './config';
import {admin} from './config';
import {TaggedTopic} from './topics';

const db = admin.firestore();

export function flatten(arr: Array<any>, result: Array<any> = []) {
  for (let i = 0, length = arr.length; i < length; i++) {
    const value = arr[i];
    if (Array.isArray(value)) {
      flatten(value, result);
    } else {
      result.push(value);
    }
  }
  return result;
}

export function doFollowPreferencesBlockPost(
  comparisonType: 'topics' | 'postTypes',
  postData: Post,
  followerPreferencesOmissions: Array<any>
) {
  if (comparisonType === 'topics') {
    const postTopics: TaggedTopic[] = postData.topics;
    if (!postTopics || postTopics.length === 0) {
      if (
        followerPreferencesOmissions.some(
          (followerPreference) => followerPreference.id === 'noTopics'
        )
      )
        return true;
      return false;
    }
    let postIsBlocked = false;
    postTopics.forEach((postTopic) => {
      if (
        followerPreferencesOmissions.some(
          (followerPreference) => followerPreference.id === postTopic.id
        )
      )
        postIsBlocked = true;
    });
    return postIsBlocked;
  }
  if (comparisonType === 'postTypes') {
    if (postData[ResourceTypes.PUBLICATION]) {
      if (
        followerPreferencesOmissions.some(
          (followerPreference) =>
            followerPreference.id === ResourceTypesCollections.PUBLICATIONS
        )
      )
        return true;
      return false;
    }
    if (postData[ResourceTypes.OPEN_POSITION]) {
      if (
        followerPreferencesOmissions.some(
          (followerPreference) =>
            followerPreference.id === ResourceTypesCollections.OPEN_POSITIONS
        )
      )
        return true;
      return false;
    }
    if (
      followerPreferencesOmissions.some(
        (followerPreference) => followerPreference.id === 'general'
      )
    )
      return true;
    return false;
  }
  return false;
}

export async function checkUserIsMemberOfGroup(
  authorID: string,
  groupID: string
) {
  return db
    .doc(`users/${authorID}/groups/${groupID}`)
    .get()
    .then((ds) => {
      if (!ds.exists) {
        return false;
      }
      return true;
    })
    .catch((err) => {
      console.error(
        'unable to verify if user with id' +
          authorID +
          'is a member of group with id' +
          groupID,
        err
      );
      throw new Error(
        'unable to verify if user with id' +
          authorID +
          'is a member of group with id' +
          groupID
      );
    });
}

export interface FollowPostTypePreferences {
  name: string;
  id:
    | ResourceTypesCollections.PUBLICATIONS
    | ResourceTypesCollections.OPEN_POSITIONS
    | 'general';
}

export interface FollowNoTopicsPreference {
  id: 'noTopics';
  name: string;
}
