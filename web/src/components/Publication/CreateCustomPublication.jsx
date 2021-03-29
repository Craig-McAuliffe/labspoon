import {Form, Formik} from 'formik';
import React, {useState, useContext, useEffect} from 'react';
import TertiaryButton from '../Buttons/TertiaryButton';
import FormTextInput from '../Forms/FormTextInput';
import {FindAndAddUsersToForm} from '../Forms/AddUserToForm';
import * as Yup from 'yup';

import './CreateCustomPublication.css';
import {PublicationIcon} from '../../assets/ResourceTypeIcons';
import CreateResourceFormActions from '../Forms/CreateResourceFormActions';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import {RemoveIcon} from '../../assets/GeneralActionIcons';
import NegativeButton from '../Buttons/NegativeButton';
import UserListItem from '../User/UserListItem';
import {db} from '../../firebase';
import SuccessMessage from '../Forms/SuccessMessage';
import ErrorMessage from '../Forms/ErrorMessage';
import {AuthContext} from '../../App';
import {userToCustomPubUserRef} from '../../helpers/users';
import TagTopics from '../Topics/TagTopics';
import {Alert} from 'react-bootstrap';

export const MAX_DAILY_PUBLICATIONS_COUNT = 30;

export default function CreateCustomPublication() {
  const [isAdding, setIsAdding] = useState(false);
  const [success, setSuccess] = useState(false);
  if (!isAdding)
    return (
      <div className="create-custom-publication-container">
        <p className="create-custom-publication-text">
          Can&#39;t find what you are looking?
        </p>
        <div className="create-custom-publication-button-container">
          <TertiaryButton onClick={() => setIsAdding(true)}>
            <h4>Manually Add Publication</h4>
          </TertiaryButton>
        </div>
        {success && <SuccessMessage>Publication Created!</SuccessMessage>}
      </div>
    );

  return (
    <div className="create-custom-publication-container">
      <h4 className="create-custom-publication-title">
        Manually add a publication
      </h4>
      <p className="create-custom-publication-text">
        We recommend first searching for your publication with the button above.
      </p>

      <CreateCustomPublicationForm
        setIsAdding={setIsAdding}
        setSuccess={setSuccess}
      />
    </div>
  );
}

function CreateCustomPublicationForm({setIsAdding, setSuccess}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const {userProfile} = useContext(AuthContext);
  const [authors, setAuthors] = useState([userProfile]);
  const [savedFormData, setSavedFormData] = useState();
  const [hasHitMaxDailyPublications, setHasHitMaxDailyPublications] = useState(
    false
  );
  const userID = userProfile ? userProfile.id : undefined;
  useEffect(async () => {
    if (!userID) return;
    if (hasHitMaxDailyPublications) return;
    const publicationActivityCount = await db
      .doc(`activity/publicationsActivity/creators/${userID}`)
      .get()
      .catch((err) => console.error(err));
    if (
      publicationActivityCount &&
      publicationActivityCount.exists &&
      publicationActivityCount.data().dailyPublicationCount >=
        MAX_DAILY_PUBLICATIONS_COUNT
    )
      setHasHitMaxDailyPublications(true);
  }, [userID]);

  const initialValues = savedFormData
    ? savedFormData
    : {
        url: '',
        title: '',
      };

  const validationSchema = Yup.object({
    url: Yup.string()
      .url()
      .required('Please add a url link to the publication'),
    title: Yup.string()
      .required('Please add the title of the publication')
      .max(1000, 'The maximum title length is 1000 characters.'),
  });

  const removeAuthor = (author) => {
    setAuthors((currentAuthors) =>
      currentAuthors.filter((currentAuthor) => currentAuthor !== author)
    );
  };
  if (submitting) return <LoadingSpinner />;
  if (hasHitMaxDailyPublications) return <MaxDailyPublicationLimitReached />;
  return (
    <div className="create-custom-pub-form-container">
      {error && (
        <ErrorMessage noBorder={true}>
          Something went wrong. Please try again.
        </ErrorMessage>
      )}
      <div className="create-custom-publication-remove-icons-container">
        <div className="create-custom-publication-icon-container">
          <PublicationIcon />
          <h3>Custom Publication</h3>
        </div>
        <button
          className="create-custom-remove-icon-container"
          onClick={() => setIsAdding(false)}
        >
          <RemoveIcon />
        </button>
      </div>
      <Formik
        validationSchema={validationSchema}
        initialValues={initialValues}
        onSubmit={(res) => {
          if (submitting) return;
          createCustomPublication(
            res,
            authors,
            setSubmitting,
            setSuccess,
            () => setError(true),
            selectedTopics,
            setIsAdding,
            setSavedFormData,
            hasHitMaxDailyPublications
          );
        }}
      >
        <Form id="create-custom-publication-form">
          <FormTextInput name="title" label="Title of the publication" />
          <FormTextInput name="url" label="Url of the publication" />
        </Form>
      </Formik>

      <FindAndAddUsersToForm
        onUserSelect={(user) =>
          setAuthors((existingAuthors) => [...existingAuthors, user])
        }
        searchBarLabel="Add authors on Labspoon"
      />
      <SelectedAuthors
        authors={authors}
        removeAuthor={removeAuthor}
        exceptionID={userID}
      />
      <TagTopics
        submittingForm={submitting}
        selectedTopics={selectedTopics}
        setSelectedTopics={setSelectedTopics}
        noCustomTopics={true}
      />

      <CreateResourceFormActions
        submitText="Create"
        submitting={submitting}
        cancelForm={() => setIsAdding(false)}
        formID="create-custom-publication-form"
        noBorder={true}
      />
    </div>
  );
}

export function SelectedAuthors({authors, removeAuthor, exceptionID}) {
  const isException = (author) => author.id === exceptionID;
  if (!authors || authors.length === 0) return null;
  return (
    <>
      <h4 className="create-custom-publication-selected-authors-title">
        Selected Authors
      </h4>
      {authors.map((author) => (
        <UserListItem
          overrideDisplayForSelf={true}
          user={author}
          key={author.id}
          noBorder={true}
        >
          {!isException(author) && (
            <NegativeButton onClick={() => removeAuthor(author)}>
              Remove
            </NegativeButton>
          )}
        </UserListItem>
      ))}
    </>
  );
}

export function MaxDailyPublicationLimitReached() {
  return (
    <Alert variant="warning">
      You have created the maximum number of publications for today (
      {MAX_DAILY_PUBLICATIONS_COUNT}). Please try again tomorrow.
    </Alert>
  );
}

export async function createCustomPublication(
  res,
  authors,
  setSubmitting,
  setSuccess,
  setError,
  selectedTopics,
  setIsAdding,
  setSavedFormData,
  hasHitMaxDailyPublications
) {
  if (hasHitMaxDailyPublications) {
    if (setSubmitting) setSubmitting(false);
    return;
  }
  if (setSubmitting) setSubmitting(true);
  const authorRefs = authors.map((author) =>
    userToCustomPubUserRef(author, author.id, author.microsoftID)
  );
  res.authors = authorRefs;
  res.isCustomPublication = true;
  res.date = new Date().toISOString();
  res.topics = selectedTopics;
  res.filterTopicIDs = selectedTopics.map((topic) => topic.id);
  res.filterAuthorIDs = authors.map((author) => author.id);
  res.sources = [
    {
      type: 'html',
      url: res.url,
    },
  ];
  delete res.url;
  const customPublicationRef = db.collection(`publications`).doc();
  return customPublicationRef
    .set(res)
    .then(() => {
      if (setSubmitting) setSubmitting(false);
      if (setSuccess) setSuccess(true);
      if (setIsAdding) setIsAdding(false);
      return {id: customPublicationRef.id, createdCustomPublication: res};
    })
    .catch((err) => {
      console.error(`unable to create custom publication ${err}`);
      if (setSavedFormData)
        setSavedFormData({
          url: res.url,
          title: res.title,
        });
      setError();
      if (setSubmitting) setSubmitting(false);
      return false;
    });
}
