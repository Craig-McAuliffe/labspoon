import React from 'react';
import {Formik, Form} from 'formik';
import * as Yup from 'yup';

import {FeedContent} from '../../components/Layout/Content';
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
    <FeedContent>
      <Formik
        initialValues={{
          article: initialValue,
        }}
        validationSchema={validationSchema}
        onSubmit={(vals) => {}}
      >
        <Form>
          <HeaderAndBodyArticleInput name="article" />
          <PrimaryButton submit>Submit</PrimaryButton>
        </Form>
      </Formik>
    </FeedContent>
  );
}
