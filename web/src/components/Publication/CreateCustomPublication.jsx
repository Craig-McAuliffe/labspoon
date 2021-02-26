import {Form, Formik} from 'formik';
import React, {useState, useContext} from 'react';
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
import {handleTaggedTopicsNoIDs} from '../../helpers/topics';

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
    title: Yup.string().required('Please add the title of the publication'),
  });

  const removeAuthor = (author) => {
    setAuthors((currentAuthors) =>
      currentAuthors.filter((currentAuthor) => currentAuthor !== author)
    );
  };
  if (submitting) return <LoadingSpinner />;
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
            setError,
            selectedTopics,
            setIsAdding,
            setSavedFormData
          );
        }}
      >
        <Form id="create-custom-publication-form">
          <FormTextInput name="url" label="Url of the publication" />
          <FormTextInput name="title" label="Title of the publication" />
        </Form>
      </Formik>

      <FindAndAddUsersToForm
        onUserSelect={(user) =>
          setAuthors((existingAuthors) => [...existingAuthors, user])
        }
        searchBarLabel="Add authors"
      />
      <SelectedAuthors
        authors={authors}
        removeAuthor={removeAuthor}
        exceptionID={userProfile.id}
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

function SelectedAuthors({authors, removeAuthor, exceptionID}) {
  const isException = (author) => {
    author.id === exceptionID;
  };
  const authorList = authors.map((author) => (
    <UserListItem user={author} key={author.id} noBorder={true}>
      {isException(author) ? null : (
        <NegativeButton onClick={() => removeAuthor(author)}>
          Remove
        </NegativeButton>
      )}
    </UserListItem>
  ));
  return (
    <>
      <h4 className="create-custom-publication-selected-authors-title">
        Selected Authors
      </h4>
      {authorList}
    </>
  );
}

async function createCustomPublication(
  res,
  authors,
  setSubmitting,
  setSuccess,
  setError,
  selectedTopics,
  setIsAdding,
  setSavedFormData
) {
  setSubmitting(true);
  const authorRefs = authors.map((author) =>
    userToCustomPubUserRef(author, author.id, author.microsoftID)
  );
  res.authors = authorRefs;
  res.isCustomPublication = true;
  res.date = new Date().toDateString();
  const taggedTopicsArray = [];
  await handleTaggedTopicsNoIDs(selectedTopics, taggedTopicsArray);
  res.topics = taggedTopicsArray;
  res.filterTopicIDs = taggedTopicsArray.map((topic) => topic.id);
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
      setSubmitting(false);
      setSuccess(true);
      setIsAdding(false);
    })
    .catch((err) => {
      console.error(`unable to create custom publication ${err}`);
      setSavedFormData({
        url: res.url,
        title: res.title,
      });
      setSubmitting(false);
      setError(true);
    });
}
