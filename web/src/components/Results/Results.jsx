import React, {useContext, useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';
import {useLocation} from 'react-router-dom';
import SearchBar from '../SearchBar';
import Post from '../Posts/Post/Post';
import BookmarkListItem from '../Bookmarks/BookmarkListItem/BookmarkListItem';
import PublicationListItem from '../Publication/PublicationListItem';
import UserListItem from '../User/UserListItem';
import ImageListItem, {ImagesSection} from '../Images/ImageListItem';
import VideoListItem from '../Videos/VideoListItem';
import GroupListItem from '../Group/GroupListItem';
import FollowGroupButton from '../Group/FollowGroupButton';
import TopicListItem from '../Topics/TopicListItem';
import FollowTopicButton from '../Topics/FollowTopicButton';
import FollowUserButton from '../User/FollowUserButton/FollowUserButton';
import {FilterableResultsContext} from '../FilterableResults/FilterableResults';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import OpenPositionListItem from '../OpenPosition/OpenPositionListItem';
import ResearchFocusListItem from '../ResearchFocus/ResearchFocusListItem';
import TechniqueListItem from '../Techniques/TechniqueListItem';
import {
  OPENPOSITION,
  RESEARCHFOCUS,
  TECHNIQUE,
} from '../../helpers/resourceTypeDefinitions';

import './Results.css';

/**
 * Displays an infinitely scrolling list of posts.
 * @param {Array} results - results to render
 * @param {Boolean} hasMore - whether there are more results that can be loaded
 * @param {Function} fetchMore - when called returns the next page of results
 * @return {React.ReactElement}
 */
export default function Results({results, hasMore, fetchMore, activeTabID}) {
  const [resourceTypes, setResourceTypes] = useState(new Set());
  const [resultComponents, setResultComponents] = useState([]);
  const currentLocation = useLocation().pathname;
  const filterableResults = useContext(FilterableResultsContext);
  const loading = filterableResults.loadingResults;

  useEffect(() => {
    const currentResourceTypes = new Set();
    setResultComponents(
      results.map((result) => {
        currentResourceTypes.add(result.resourceType);
        return (
          <GenericListItem
            key={result.id || result.microsoftID}
            result={result}
            bookmarkedVariation
          />
        );
      })
    );
    setResourceTypes(currentResourceTypes);
  }, [results, setResultComponents, setResourceTypes]);

  if (resourceTypes.size > 1)
    return <MixedResultsPage results={resultComponents} />;

  const endMessage =
    currentLocation === '/' ? (
      <SearchBar bigSearchPrompt={true} />
    ) : (
      <p className="end-result">No more results</p>
    );

  let content = resultComponents;
  if (resourceTypes.size === 1 && resourceTypes.has('image')) {
    content = <ImagesSection>{resultComponents}</ImagesSection>;
  }

  return (
    <InfiniteScroll
      dataLength={resultComponents.length}
      hasMore={hasMore}
      next={fetchMore}
      endMessage={endMessage}
      style={{minWidth: '100%'}}
    >
      {loading && <LoadingSpinner />}
      {content}
    </InfiniteScroll>
  );
}
Results.propTypes = {
  results: PropTypes.array.isRequired,
  hasMore: PropTypes.bool.isRequired,
  fetchMore: PropTypes.func.isRequired,
};

export function GenericListItem({result, onBookmarkPage}) {
  switch (result.resourceType) {
    case 'post':
      return (
        <Post
          post={result}
          key={result.id + 'post'}
          bookmarkedVariation={onBookmarkPage}
        />
      );
    case 'bookmark':
      return (
        <BookmarkListItem bookmark={result} key={result.id + 'bookmark'} />
      );
    case 'publication':
      return (
        <PublicationListItem
          publication={result}
          key={result.id || result.microsoftID + 'publication'}
          bookmarkedVariation={onBookmarkPage}
        />
      );
    case 'user':
      return (
        <UserListItem user={result} key={result.id + 'user'}>
          <FollowUserButton targetUser={result} />
        </UserListItem>
      );
    case 'group':
      return (
        <GroupListItem key={result.id + 'group'} group={result}>
          <FollowGroupButton targetGroup={result} />
        </GroupListItem>
      );
    case 'topic':
      return (
        <TopicListItem key={result.id + 'topic'} topic={result}>
          <FollowTopicButton targetTopic={result} />
        </TopicListItem>
      );
    case 'image':
      return (
        <ImageListItem
          src={result.src}
          alt={result.alt}
          key={result.id + 'image'}
        />
      );
    case 'video':
      return (
        <VideoListItem
          src={result.src}
          key={result.id + 'video'}
          title={`video from ${result.src}`}
        />
      );
    case OPENPOSITION:
      return (
        <OpenPositionListItem
          openPosition={result}
          key={result.id + OPENPOSITION}
        />
      );
    case RESEARCHFOCUS:
      return (
        <ResearchFocusListItem
          researchFocus={result}
          key={result.id + RESEARCHFOCUS}
        />
      );
    case TECHNIQUE:
      return (
        <TechniqueListItem technique={result} key={result.id + TECHNIQUE} />
      );
    default:
      return null;
  }
}

function MixedResultsPage({results}) {
  const publicationResults = results.filter(
    (result) => result.resourceType === 'publication'
  );
  const userResults = results.filter(
    (result) => result.resourceType === 'user'
  );
  const imageResults = results.filter(
    (result) => result.resourceType === 'image'
  );
  const postResults = results.filter(
    (result) => result.resourceType === 'post'
  );

  return (
    <div>
      {imageResults.length > 0 ? (
        <div className="mixed-tab-section">
          <h3 className="mixed-tab-section-header">Images</h3>
          <ImagesSection images={imageResults} />
        </div>
      ) : null}
      {publicationResults.length > 0 ? (
        <div className="mixed-tab-section">
          <h3 className="mixed-tab-section-header">Publications</h3>
          {publicationResults.map((publication) => (
            <PublicationListItem
              key={publication.id + 'publication'}
              publication={publication}
              mixedResults={true}
            />
          ))}
        </div>
      ) : null}
      {userResults.length > 0 ? (
        <div className="mixed-tab-section">
          <h3 className="mixed-tab-section-header">Researchers</h3>
          {userResults.map((user) => (
            <UserListItem key={user.id + 'user'} user={user}>
              <FollowUserButton targetUser={user} />
            </UserListItem>
          ))}
        </div>
      ) : null}
      {postResults.length > 0 ? (
        <div className="mixed-tab-section">
          <h3 className="mixed-tab-section-header">Posts</h3>
          {postResults.map((post) => (
            <Post key={post.id + 'post'} post={post} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function SelectableResults({selectedItems, setSelectedItems}) {
  // This should not really depend on the FilterableResultsContext directly.
  // When we want to use it in other places too, we should wrap it with
  // a component that retrives the FilterableResultsContext, similarly to what
  // we do with NewResultsWrapper.
  const filterableResults = useContext(FilterableResultsContext);
  const results = filterableResults.results;
  const hasMore = filterableResults.hasMore;
  const fetchMore = filterableResults.fetchMore;

  if (filterableResults.resultsError)
    return <h1>{filterableResults.resultsError}</h1>;

  const selectedIDs = new Set(selectedItems.map((item) => item.id));

  const items = results.map((result) => {
    const selected = selectedIDs.has(result.id);
    return (
      <SelectableGenericListItem
        key={result.id}
        result={result}
        selected={selected}
        setSelected={() =>
          setItemSelectedState(result, !selected, setSelectedItems)
        }
      />
    );
  });
  const endMessage = <p className="end-result">No more results</p>;

  return (
    <>
      <InfiniteScroll
        dataLength={items.length}
        hasMore={hasMore}
        next={fetchMore}
        style={{minWidth: '100%'}}
        endMessage={endMessage}
      >
        {items}
      </InfiniteScroll>
    </>
  );
}

function setItemSelectedState(result, willAdd, setSelectedItems) {
  if (willAdd) {
    setSelectedItems((items) => [...items, result]);
    return;
  }
  setSelectedItems((items) => items.filter((item) => item.id !== result.id));
}

function SelectableGenericListItem({result, selected, setSelected}) {
  return (
    <div className="post-with-selector-container">
      <GenericListItem result={result} />
      <Select
        selected={selected}
        toggle={() => setSelected(result)}
        alreadyPresent={result._alreadyPresent}
      />
    </div>
  );
}

function Select({toggle, selected, alreadyPresent}) {
  if (alreadyPresent)
    return (
      <div className="post-selector-container">
        <p className="post-selector-inactive-text">Already added</p>
      </div>
    );
  const buttonClassName =
    'post-selector-button-' + (selected ? 'active' : 'inactive');
  return (
    <div className="post-selector-container">
      <button className={buttonClassName} onClick={toggle} />
      <p className="post-selector-active-text">Select</p>
    </div>
  );
}
