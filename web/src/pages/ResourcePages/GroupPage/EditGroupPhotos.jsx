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
  const [groupAvatar, setGroupAvatar] = useState();
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [last, setLast] = useState();
  const groupID = useParams().groupID;

  async function fetchMore() {
    setLoading(true);
    await getPaginatedImagesFromCollectionRef(
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

  useEffect(async () => {
    if (!groupID) return;
    const groupDS = await db
      .doc(`groups/${groupID}`)
      .get()
      .catch((err) =>
        console.error(
          'unable to fetch group doc for group with id ' + groupID,
          err
        )
      );
    if (!groupDS || !groupDS.exists) return;
    if (groupDS.data().avatar) setGroupAvatar(groupDS.data().avatar);
  }, [groupID]);

  useEffect(() => {
    if (last !== undefined) return;
    fetchMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [last]);

  function refresh() {
    setPhotos([]);
    setLast(undefined);
    setGroupAvatar(undefined);
  }

  return (
    <PaddedPageContainer>
      {children}
      <GroupAvatarUpload
        groupID={groupID}
        groupAvatar={groupAvatar}
        refresh={refresh}
      />
      <GroupImageUpload groupID={groupID} refresh={refresh} />
      <Results results={photos} hasMore={hasMore} fetchMore={fetchMore} />
      {loading ? <LoadingSpinner /> : <></>}
    </PaddedPageContainer>
  );
}

function GroupAvatarUpload({groupID, groupAvatar, refresh}) {
  return (
    <div>
      <h3 className="edit-group-photos-sub-title">Group Profile Picture</h3>
      <ImageUpload
        storageDir={`groups/${groupID}/avatar`}
        existingAvatar={groupAvatar}
        isAvatar={true}
        shouldResize={true}
        refresh={refresh}
      />
    </div>
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
    <div className="edit-group-photos-more-pictures-section">
      <h3 className="edit-group-photos-sub-title">More Pictures</h3>
      <ImageUpload
        storageDir={`groups/${groupID}/photos`}
        updateDB={updateDB}
        refresh={refresh}
        multipleImages={true}
        maxImages={12}
        shouldResize={true}
      />
    </div>
  );
}
