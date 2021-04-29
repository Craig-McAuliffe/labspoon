import {Form, Formik} from 'formik';
import React, {useContext, useEffect, useState} from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import HeaderAndBodyArticleInput, {
  CreateRichTextCharacterCount,
  yupRichBodyOnlyValidation,
} from '../Forms/Articles/HeaderAndBodyArticleInput';
import GeneralError, {AuthError} from '../GeneralError';
import {LoadingSpinnerPage} from '../LoadingSpinner/LoadingSpinner';
import {db} from '../../firebase';
import * as Yup from 'yup';
import CreateResourceFormActions from '../Forms/CreateResourceFormActions';
import ErrorMessage from '../Forms/ErrorMessage';
import NotFoundPage from '../../pages/NotFoundPage/NotFoundPage';
import {AuthContext} from '../../App';
import {PaddedPageContainer} from '../Layout/Content';
import {articleTitleValidation, MAX_ARTICLE_CHARACTERS} from './Article';
import FormTextInput from '../Forms/FormTextInput';

export default function EditArticle({
  articleCollectionName,
  articleID,
  articleType,
}) {
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingError, setLoadingError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [articleDetails, setArticleDetails] = useState();
  const [submitting, setSubmitting] = useState();
  const [authError, setAuthError] = useState(false);
  const [savedInitialValues, setSavedInitialValues] = useState();
  const [uploadError, setUploadError] = useState(false);
  const history = useHistory();
  const locationState = useLocation().state;
  const articleDBRef = db.doc(`${articleCollectionName}/${articleID}`);
  const articleGroupRef = articleDetails
    ? db.doc(
        `groups/${articleDetails.group.id}/${articleCollectionName}/${articleID}`
      )
    : undefined;
  const {userProfile, authLoaded} = useContext(AuthContext);
  useEffect(async () => {
    if (!userProfile) return;
    const articleDS = await articleDBRef
      .get()
      .catch((err) =>
        console.error(
          `unable to fetch data for ${articleType} with id ${articleID} ${err}`
        )
      );
    if (!articleDS) {
      setLoadingError(true);
      setLoadingPage(false);
      return;
    }
    if (!articleDS.exists) {
      setNotFound(true);
      setLoadingPage(false);
      return;
    }
    setArticleDetails(articleDS.data());
    const userIsMemberOfGroup = await db
      .doc(`groups/${articleDS.data().group.id}/members/${userProfile.id}`)
      .get()
      .then((ds) => {
        if (ds.exists) return true;
        return false;
      })
      .catch((err) => {
        console.error(err);
        return fale;
      });
    if (!userIsMemberOfGroup) setAuthError(true);
    setLoadingPage(false);
  }, [articleID, userProfile]);

  useEffect(() => {
    if (!articleDetails || savedInitialValues) return;
    setSavedInitialValues({
      body: articleDetails.body,
      title: articleDetails.title,
    });
  }, [articleDetails]);

  if (loadingPage || !authLoaded) return <LoadingSpinnerPage />;
  if (loadingError) return <GeneralError />;
  if (authError) return <AuthError />;
  if (notFound) return <NotFoundPage />;
  if (!savedInitialValues) return <LoadingSpinnerPage />;
  const onSubmit = async (res) => {
    setSubmitting(true);
    if (
      res.title === articleDetails.title &&
      JSON.stringify(res.body) === JSON.stringify(articleDetails.body)
    ) {
      history.push(`/${articleType}/${articleID}`);
      return;
    }
    const batch = db.batch();

    batch.update(articleDBRef, {
      title: res.title,
      body: res.body,
    });
    batch.update(articleGroupRef, {
      title: res.title,
      body: res.body,
    });
    await batch
      .commit()
      .then(() => {
        locationState
          ? history.push(locationState.previousLocation)
          : history.push(
              `/groups/${articleDetails.group.id}/${articleCollectionName}`
            );
      })
      .catch((err) => {
        console.error(
          `failed to update ${articleType} with id ${articleID} ${err}`
        );
        setUploadError(true);
      });
    setSavedInitialValues({
      articleTitle: res.title,
      body: res.body,
    });
    setSubmitting(false);
  };

  return (
    <PaddedPageContainer>
      {uploadError && (
        <ErrorMessage noBorder={true}>
          Something went wrong. Please try again.
        </ErrorMessage>
      )}
      <Formik
        initialValues={savedInitialValues}
        validationSchema={Yup.object({
          title: articleTitleValidation,
          body: yupRichBodyOnlyValidation(MAX_ARTICLE_CHARACTERS, 40),
        })}
        onSubmit={onSubmit}
      >
        <Form>
          <FormTextInput name="title" label="Title" />
          <HeaderAndBodyArticleInput
            name="body"
            shouldAutoFocus={true}
            label="Body"
            minHeight={300}
          />
          <CreateRichTextCharacterCount
            name="body"
            maxCount={MAX_ARTICLE_CHARACTERS}
          />
          <CreateResourceFormActions
            submitting={submitting}
            submitText="Save"
            cancelForm={() => {
              locationState
                ? history.push(locationState.previousLocation)
                : history.push(`/${articleType}/${articleID}`);
            }}
          />
        </Form>
      </Formik>
    </PaddedPageContainer>
  );
}
