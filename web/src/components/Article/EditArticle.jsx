import {Form, Formik} from 'formik';
import React, {useContext, useEffect, useState} from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import HeaderAndBodyArticleInput, {
  yupRichBodyOnlyValidation,
} from '../Forms/Articles/HeaderAndBodyArticleInput';
import GeneralError from '../GeneralError';
import {LoadingSpinnerPage} from '../LoadingSpinner/LoadingSpinner';
import {db} from '../../firebase';
import * as Yup from 'yup';
import CreateResourceFormActions from '../Forms/CreateResourceFormActions';
import ErrorMessage from '../Forms/ErrorMessage';
import NotFoundPage from '../../pages/NotFoundPage/NotFoundPage';
import {AuthContext} from '../../App';
import {PaddedPageContainer} from '../Layout/Content';
import {
  articleTitleValidation,
  CreateArticleCharacterCount,
  MAX_ARTICLE_CHARACTERS,
} from './Article';
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
  const [savedInitialValues, setSavedInitialValues] = useState();
  const [uploadError, setUploadError] = useState(false);
  const history = useHistory();
  const locationState = useLocation().state;
  const articleDBRef = db.doc(`${articleCollectionName}/${articleID}`);
  const {userProfile} = useContext(AuthContext);
  useEffect(async () => {
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
    setLoadingPage(false);
  }, [articleID]);

  useEffect(() => {
    if (!articleDetails || savedInitialValues) return;
    setSavedInitialValues({
      body: articleDetails.body,
      title: articleDetails.title,
    });
  }, [articleDetails]);

  if (loadingPage) return <LoadingSpinnerPage />;
  if (loadingError) return <GeneralError />;
  if (notFound) return <NotFoundPage />;
  if (!savedInitialValues) return <LoadingSpinnerPage />;
  if (userProfile.id !== articleDetails.author.id) history.replace('/');
  const onSubmit = async (res) => {
    setSubmitting(true);
    if (
      res.title === articleDetails.title &&
      JSON.stringify(res.body) === JSON.stringify(articleDetails.body)
    ) {
      history.push(`/${articleType}/${articleID}`);
      return;
    }
    await articleDBRef
      .update({
        title: res.title,
        body: res.body,
      })
      .then(() => {
        locationState
          ? history.push(locationState.previousLocation)
          : history.push(`/${articleType}/${articleID}`);
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
          <CreateArticleCharacterCount name="body" />
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
