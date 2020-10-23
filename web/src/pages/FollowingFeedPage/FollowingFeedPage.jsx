import React, {useContext, useEffect, useState} from 'react';

import {db} from '../../firebase';
import {AuthContext, FeatureFlags} from '../../App';
import {getEnabledIDsFromFilter} from '../../helpers/filters';
import FilterableResults, {
  NewFilterMenuWrapper,
  NewResultsWrapper,
  ResourceTabs,
  FilterManager,
} from '../../components/FilterableResults/FilterableResults';
import CreatePost from '../../components/Posts/Post/CreatePost/CreatePost';
import HomePageTabs from '../../components/HomePageTabs';
import {translateOptionalFields} from '../../helpers/posts';

// Due to the limitations in firestore filters described in
// https://firebase.google.com/docs/firestore/query-data/queries it is not
// possible to use multiple many-to-many filters (ie. `array-contains-any` and
// `in`).
function fetchUserFeedData(uuid, skip, limit, filter, last) {
  const collection = db
    .collection(`users/${uuid}/feeds/followingFeed/posts`)
    .orderBy('timestamp', 'desc');
  return filterFeedData(collection, skip, limit, filter, last);
}

function filterFeedData(collection, skip, limit, filter, last) {
  const enabledIDs = getEnabledIDsFromFilter(filter);
  if (enabledIDs.size !== 0) {
    const enabledAuthorIDs = enabledIDs.get('Author');
    const enabledPostTypeIDs = enabledIDs.get('Post Type');

    if (enabledPostTypeIDs.length === 1) {
      collection = collection.where(
        'filter_postType_id',
        '==',
        enabledPostTypeIDs[0]
      );
    }
    if (enabledPostTypeIDs.length > 1) {
      collection = collection.where(
        'filter_PostType_id',
        'in',
        enabledAuthorIDs
      );
    }

    if (enabledAuthorIDs.length === 1) {
      collection = collection.where(
        'filter_author_id',
        '==',
        enabledAuthorIDs[0]
      );
    }
    if (enabledAuthorIDs.length > 1) {
      collection = collection.where('filter_author_id', 'in', enabledAuthorIDs);
    }

    const enabledTopicIDs = enabledIDs.get('Topics');
    if (enabledTopicIDs !== undefined) {
      if (enabledTopicIDs.length === 1) {
        collection = collection.where(
          'filter_topic_ids',
          'array-contains',
          enabledTopicIDs[0]
        );
      }
      if (enabledTopicIDs.length > 1) {
        collection = collection.where(
          'filter_topic_ids',
          'array-contains-any',
          enabledTopicIDs
        );
      }
    }
  }

  const sortedAndPaginatedResults = sortAndPaginateFeedData(
    collection,
    last,
    limit
  );
  return sortedAndPaginatedResults.then(translateOptionalFields);
}

function sortAndPaginateFeedData(results, last, limit) {
  if (typeof last !== 'undefined') {
    results = results.startAt(last.timestamp);
  }
  return results
    .limit(limit)
    .get()
    .then((qs) => {
      const posts = [];
      qs.forEach((doc) => {
        const post = doc.data();
        post.id = doc.id;
        post.resourceType = 'post';
        posts.push(post);
      });
      return posts;
    })
    .catch((err) => console.log(err));
}

function getFiltersFromFilterCollection(filterCollection) {
  const filterCollections = [];
  filterCollection.forEach((filterCollectionDoc) => {
    const filterCollectionData = filterCollectionDoc.data();
    const filterOptionsPromise = filterCollectionDoc.ref
      .collection('filterOptions')
      .orderBy('rank')
      .limit(10)
      .get()
      .then((qs) => {
        const filterCollection = {
          collectionName: filterCollectionData.resourceName,
          options: [],
          mutable: true,
        };
        qs.forEach((doc) => {
          const filterOptionData = doc.data();
          filterCollection.options.push({
            data: {
              id: filterOptionData.resourceID,
              name: filterOptionData.name,
            },
            enabled: false,
          });
        });
        return filterCollection;
      })
      .catch((err) => console.log('filter err', err));
    filterCollections.push(filterOptionsPromise);
  });
  return Promise.all(filterCollections);
}

function fetchUserFeedFilters(uuid) {
  const results = db
    .collection(`users/${uuid}/feeds/followingFeed/filterCollections`)
    .get()
    .then((fcqs) => getFiltersFromFilterCollection(fcqs))
    .catch((err) => console.log(err));
  return results;
}

export default function FollowingFeedPage() {
  const [userID, setUserID] = useState(undefined);
  const {user} = useContext(AuthContext);
  const featureFlags = useContext(FeatureFlags);

  useEffect(() => {
    if (user) setUserID(user.uid);
  }, [user]);

  const getDefaultFilter = () => {
    if (!userID) {
      setTimeout(() => {
        if (!user) {
          setUserID('no user');
        }
      }, 10);
      return 'loading';
    }
    if (userID === 'no user') return [];
    return fetchUserFeedFilters(userID);
  };

  const fetchResults = (skip, limit, filter, last) => {
    if (!userID) return [];
    return fetchUserFeedData(userID, skip, limit, filter, last);
  };

  return (
    <FilterableResults fetchResults={fetchResults} limit={10} loadingFilter>
      <div className="sider-layout">
        <FilterManager>
          <NewFilterMenuWrapper getDefaultFilter={getDefaultFilter} />
          <ResourceTabs />
        </FilterManager>
      </div>
      <div className="content-layout">
        <div className="feed-container">
          {featureFlags.has('create-post') ? <CreatePost /> : <></>}
          {featureFlags.has('news') ? <HomePageTabs /> : <></>}
          <NewResultsWrapper />
        </div>
      </div>
    </FilterableResults>
  );
}
