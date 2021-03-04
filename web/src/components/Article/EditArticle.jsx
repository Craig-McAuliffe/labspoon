import {Form, Formik} from 'formik';
import React, {useContext, useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';
import HeaderAndBodyArticleInput, {
  getTitleTextAndBody,
  mergeTitleAndBody,
  yupArticleValidation,
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
      articleText: mergeTitleAndBody(articleDetails.title, articleDetails.body),
    });
  }, [articleDetails]);

  if (loadingPage) return <LoadingSpinnerPage />;
  if (loadingError) return <GeneralError />;
  if (notFound) return <NotFoundPage />;
  if (!savedInitialValues) return <LoadingSpinnerPage />;
  if (userProfile.id !== articleDetails.author.id) history.replace('/');
  const onSubmit = async (res) => {
    setSubmitting(true);
    const [title, body] = getTitleTextAndBody(res.articleText);
    if (
      title === articleDetails.title &&
      JSON.stringify(body) === JSON.stringify(articleDetails.body)
    ) {
      history.push(`/${articleType}/${articleID}`);
      return;
    }
    await articleDBRef
      .update({
        title: title,
        body: body,
      })
      .then(() => {
        history.push(`/${articleType}/${articleID}`);
      })
      .catch((err) => {
        console.error(
          `failed to update ${articleType} with id ${articleID} ${err}`
        );
        setUploadError(true);
      });
    setSavedInitialValues({
      articleText: res.articleText,
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
          articleText: yupArticleValidation,
        })}
        onSubmit={onSubmit}
      >
        <Form>
          <HeaderAndBodyArticleInput name="articleText" />
          <CreateResourceFormActions
            submitting={submitting}
            submitText="Create"
          />
        </Form>
      </Formik>
    </PaddedPageContainer>
  );
}
