import React, {useContext, useEffect, useState} from 'react';
import {Form, Formik} from 'formik';
import * as Yup from 'yup';
import {AuthContext} from '../../App';
import LoadingSpinner, {
  LoadingSpinnerPage,
} from '../LoadingSpinner/LoadingSpinner';
import HeaderAndBodyArticleInput, {
  CreateRichTextCharacterCount,
  initialValueNoTitle,
  yupRichBodyOnlyValidation,
} from '../Forms/Articles/HeaderAndBodyArticleInput';
import TagTopics from '../Topics/TagTopics';
import CreateResourceFormActions from '../Forms/CreateResourceFormActions';
import {db} from '../../firebase';
import FormImageUpload from '../Images/FormImageUpload';
import addArticleToDB from '../../helpers/articles';
import {TECHNIQUES} from '../../helpers/resourceTypeDefinitions';
import {uploadImagesAndGetURLs} from '../../helpers/images';
import FormTextInput from '../Forms/FormTextInput';
import {
  articleTitleValidation,
  MAX_ARTICLE_CHARACTERS,
} from '../Article/Article';
import GeneralError from '../GeneralError';

export default function CreateTechnique({
  groupID,
  cancelAction,
  successFunction,
}) {
  const [selectedGroup, setSelectedGroup] = useState(undefined);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [pageError, setPageError] = useState(false);
  const [savedInitialValues, setSavedInitialValues] = useState({
    body: initialValueNoTitle,
    title: '',
    photos: [],
  });
  const {authLoaded, user} = useContext(AuthContext);
  if (!authLoaded) return <LoadingSpinnerPage />;
  const userID = user.uid;

  useEffect(() => {
    db.doc(`groups/${groupID}`)
      .get()
      .then((groupDS) => {
        if (!groupDS.exists) setPageError(true);
        else {
          const groupData = groupDS.data();
          groupData.id = groupDS.id;
          setSelectedGroup(groupData);
        }
        setLoadingGroup(false);
      })
      .catch((err) => {
        console.error(
          `could not fetch groups for user ID ${userID} from db`,
          err
        );
        setLoadingGroup(false);
        setPageError(true);
      });
  }, [groupID]);

  if (pageError) return <GeneralError />;
  if (loadingGroup || submitting) return <LoadingSpinner />;

  async function onSubmit(res) {
    setSubmitting(true);
    const techniqueDBRef = db.collection(`techniques`).doc();
    const techniqueID = techniqueDBRef.id;
    const techniqueOnGroupRef = db.doc(
      `groups/${selectedGroup.id}/techniques/${techniqueID}`
    );
    const failFunction = () =>
      setSavedInitialValues({
        title: res.title,
        body: res.body,
        photos: res.photos,
      });
    if (res.photos.length === 0) {
      return addArticleToDB(
        res.title,
        res.body,
        [],
        selectedTopics,
        selectedGroup,
        undefined,
        techniqueDBRef,
        techniqueOnGroupRef,
        setSubmitting,
        TECHNIQUES,
        'techniquesCount',
        failFunction,
        successFunction
      );
    }
    const publicImageURLs = await uploadImagesAndGetURLs(
      Array.from(res.photos),
      `groups/${selectedGroup.id}/techniques/${techniqueID}`,
      selectedGroup.id
    );

    if (!publicImageURLs) {
      alert('Something went wrong, please try again');
      failFunction();
      setSubmitting(false);
      return;
    }
    const filteredPhotoURLs = publicImageURLs.filter((photoURL) => photoURL);
    return addArticleToDB(
      res.title,
      res.body,
      filteredPhotoURLs,
      selectedTopics,
      selectedGroup,
      undefined,
      techniqueDBRef,
      techniqueOnGroupRef,
      setSubmitting,
      TECHNIQUES,
      'techniquesCount',
      failFunction,
      successFunction
    );
  }
  return (
    <Formik
      initialValues={savedInitialValues}
      validationSchema={Yup.object({
        body: yupRichBodyOnlyValidation(MAX_ARTICLE_CHARACTERS, 40),
        title: articleTitleValidation,
      })}
      onSubmit={onSubmit}
    >
      <Form>
        <FormTextInput name="title" label="Title" />
        <HeaderAndBodyArticleInput
          name="body"
          label="Body"
          customPlaceholderText="...describe a technique that your group uses"
          minHeight={300}
        />
        <CreateRichTextCharacterCount
          name="body"
          maxCount={MAX_ARTICLE_CHARACTERS}
        />
        <FormImageUpload name="photos" multiple={true} maxImages={9} />
        <TagTopics
          submittingForm={submitting}
          selectedTopics={selectedTopics}
          setSelectedTopics={setSelectedTopics}
          noCustomTopics={true}
        />
        <CreateResourceFormActions
          submitting={submitting}
          submitText="Create"
          cancelForm={cancelAction}
        />
      </Form>
    </Formik>
  );
}
