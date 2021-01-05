import React, {useState, useEffect} from 'react';
import {SearchIconGrey} from '../../assets/HeaderIcons';
import firebase from '../../firebase';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

import './SearchMSFields.css';

const topicSearch = firebase.functions().httpsCallable('topics-topicSearch');

export default function SearchMSFields({
  setFetchedTopics,
  placeholder,
  setCurrentInputValue,
  searchIcon,
}) {
  const [loading, setLoading] = useState();
  const [typedTopic, setTypedTopic] = useState('');

  useEffect(() => {
    if (typedTopic.length === 0) {
      setFetchedTopics([]);
      setLoading(false);
      return;
    }
    return searchMicrosoftTopics(typedTopic, setLoading, setFetchedTopics);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typedTopic]);

  return (
    <>
      <div className="ms-fields-search-container">
        {searchIcon ? <SearchIconGrey /> : null}
        <input
          type="text"
          onChange={(e) => {
            setTypedTopic(e.target.value);
            if (setCurrentInputValue) setCurrentInputValue(e.target.value);
          }}
          placeholder={placeholder}
        />
      </div>
      {loading ? (
        <div className="ms-fields-search-loading-spinner-container">
          <LoadingSpinner />
        </div>
      ) : null}
    </>
  );
}

// clearTimeout is called on unmount from useEffect hook
const searchMicrosoftTopics = (query, setLoading, setFetchedTopics) => {
  setLoading(true);
  const apiCallTimeout = setTimeout(
    () =>
      topicSearch({topicQuery: query})
        .then((microsoftTopics) => {
          setLoading(false);
          setFetchedTopics(microsoftTopics.data);
        })
        .catch((err) => {
          setLoading(false);
          setFetchedTopics([]);
          console.log(err, 'could not search topics');
        }),
    1400
  );
  return () => clearTimeout(apiCallTimeout);
};
