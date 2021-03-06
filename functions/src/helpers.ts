import {Post} from './posts';
import {ResourceTypes, ResourceTypesCollections} from './config';
import {TaggedTopic} from './topics';

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
