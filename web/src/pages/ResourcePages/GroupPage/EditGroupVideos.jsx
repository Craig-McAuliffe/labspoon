import React, {useEffect, useState} from 'react';
import {Formik, Form} from 'formik';
import {useParams} from 'react-router-dom';
import * as Yup from 'yup';
import {db} from '../../../firebase';

import {FeedContent} from '../../../components/Layout/Content';
import FormTextInput from '../../../components/Forms/FormTextInput';
import PrimaryButton from '../../../components/Buttons/PrimaryButton';
import SuccessMessage from '../../../components/Forms/SuccessMessage';
import ErrorMessage from '../../../components/Forms/ErrorMessage';
import Results from '../../../components/Results/Results';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';

import {getPaginatedVideosFromCollectionRef} from '../../../helpers/videos';

import './EditGroupVideos.css';

export default function EditGroupVideos({children}) {
  const limit = 9;
  const [videos, setVideos] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [last, setLast] = useState();
  const groupID = useParams().groupID;

  function fetchMore() {
    setLoading(true);
    getPaginatedVideosFromCollectionRef(
      db.collection(`groups/${groupID}/videos`),
      limit + 1,
      last
    )
      .then((newResults) => {
        setHasMore(!(newResults.length <= limit));
        setVideos((oldResults) => [
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
    setVideos([]);
    if (last === undefined) {
      fetchMore();
    }
    setLast(undefined);
  }

  return (
    <FeedContent>
      {children}
      <VideoUploadForm refresh={refresh} />
      <Results results={videos} hasMore={hasMore} fetchMore={fetchMore} />
      {loading ? <LoadingSpinner /> : <></>}
    </FeedContent>
  );
}

function VideoUploadForm({refresh}) {
  const groupID = useParams().groupID;
  const [uploading, setUploading] = useState(false);
  const [displaySuccessMessage, setDisplaySuccessMessage] = useState(false);
  const [displayErrorMessage, setDisplayErrorMessage] = useState(false);
  const initialValues = {
    url: '',
  };

  const validationSchema = Yup.object({
    url: Yup.string().url('Must be valid Youtube URL'),
  });

  function onSubmit(e, {resetForm}) {
    setUploading(true);
    setDisplayErrorMessage(false);
    setDisplaySuccessMessage(false);
    db.collection(`groups/${groupID}/videos`)
      .add({
        src: getEmbedURL(e.url),
        timestamp: new Date(),
      })
      .catch((err) => {
        setDisplayErrorMessage(true);
        console.error(err);
      })
      .then(() => {
        setDisplaySuccessMessage(true);
        resetForm();
        refresh();
      })
      .finally(() => setUploading(false));
  }
  return (
    <div className="video-upload-form">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        <Form>
          {displaySuccessMessage ? <UploadSuccessMessage /> : <></>}
          {displayErrorMessage ? <UploadErrorMessage /> : <></>}
          <FormTextInput
            label="Paste the Youtube URL here, it looks like this: https://www.youtube.com/watch?v=ns2gDDiD5ag"
            name="url"
          />
          <PrimaryButton submit disabled={uploading}>
            Upload
          </PrimaryButton>
        </Form>
      </Formik>
    </div>
  );
}

function getEmbedURL(url) {
  const urlObj = new URL(url);
  const id = urlObj.searchParams.get('v');
  return `https://www.youtube.com/embed/${id}`;
}

function UploadSuccessMessage() {
  return <SuccessMessage>Video successfully added.</SuccessMessage>;
}

function UploadErrorMessage() {
  return (
    <ErrorMessage>Something went wrong. Please try again later.</ErrorMessage>
  );
}
