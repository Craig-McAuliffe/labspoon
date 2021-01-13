import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {db} from '../../../firebase';
import {getPaginatedImagesFromCollectionRef} from '../../../helpers/images';
import {PaddedPageContainer} from '../../../components/Layout/Content';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import Results from '../../../components/Results/Results';
import ImageUpload from '../../../components/Images/ImageUpload';

import './EditGroupPhotos.css';

export default function EditGroupPhotos({children}) {
  const limit = 9;
  const [photos, setPhotos] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [last, setLast] = useState();
  const groupID = useParams().groupID;

  function fetchMore() {
    setLoading(true);
    getPaginatedImagesFromCollectionRef(
      db.collection(`groups/${groupID}/photos`),
      limit + 1,
      last
    )
      .then((newResults) => {
        setHasMore(!(newResults.length <= limit));
        setPhotos((oldResults) => [
          ...oldResults,
          ...newResults.slice(0, limit),
        ]);
        setLast(newResults[newResults.length - 1]);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }

  useEffect(() => {
    if (last !== undefined) return;
    fetchMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [last]);

  function refresh() {
    setPhotos([]);
    setLast(undefined);
  }

  return (
    <PaddedPageContainer>
      {children}
      <GroupImageUpload groupID={groupID} refresh={refresh} />
      <Results results={photos} hasMore={hasMore} fetchMore={fetchMore} />
      {loading ? <LoadingSpinner /> : <></>}
    </PaddedPageContainer>
  );
}

function GroupImageUpload({groupID, refresh}) {
  function updateDB(url, id) {
    return db.doc(`groups/${groupID}/photos/${id}`).set({
      src: url,
      timestamp: new Date(),
    });
  }
  return (
    <ImageUpload
      storageDir={`groups/${groupID}/photos`}
      updateDB={updateDB}
      refresh={refresh}
      multipleImages={true}
    />
  );
}
