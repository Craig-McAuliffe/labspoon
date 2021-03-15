import React from 'react';
import {Formik, Form} from 'formik';
import * as Yup from 'yup';

import {PaddedPageContainer} from '../../components/Layout/Content';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import HeaderAndBodyArticleInput, {
  yupArticleValidation,
  initialValue,
} from '../../components/Forms/Articles/HeaderAndBodyArticleInput';

const validationSchema = Yup.object({
  article: yupArticleValidation,
});

export default function CreateArticlePage() {
  return (
    <PaddedPageContainer>
      <Formik
        initialValues={{
          article: initialValue,
        }}
        validationSchema={validationSchema}
        onSubmit={(vals) => {}}
      >
        <Form>
          <HeaderAndBodyArticleInput name="article" shouldAutoFocus={true} />
          <PrimaryButton submit>Submit</PrimaryButton>
        </Form>
      </Formik>
    </PaddedPageContainer>
  );
}
