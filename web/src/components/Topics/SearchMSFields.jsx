import React, {useState, useEffect} from 'react';
import {SearchIconGrey} from '../../assets/HeaderIcons';
import firebase from '../../firebase';

import './SearchMSFields.css';

const topicSearch = firebase.functions().httpsCallable('topics-topicSearch');

export default function SearchMSFields({
  setFetchedTopics,
  placeholder,
  setCurrentInputValue,
  searchIcon,
  setLoading,
  limit,
}) {
  const [typedTopic, setTypedTopic] = useState('');

  useEffect(() => {
    if (typedTopic.length === 0) {
      setFetchedTopics([]);
      setLoading(false);
      return;
    }
    return searchMicrosoftTopics(
      typedTopic,
      setLoading,
      setFetchedTopics,
      limit
    );
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
    </>
  );
}

// clearTimeout is called on unmount from useEffect hook
const searchMicrosoftTopics = (query, setLoading, setFetchedTopics, limit) => {
  setLoading(true);
  const apiCallTimeout = setTimeout(
    () =>
      topicSearch({topicQuery: query, limit: limit})
        .then((microsoftTopics) => {
          setLoading(false);
          setFetchedTopics(microsoftTopics.data);
        })
        .catch((err) => {
          setLoading(false);
          setFetchedTopics([]);
          console.log(err, 'could not search topics');
        }),
    500
  );
  return () => clearTimeout(apiCallTimeout);
};
