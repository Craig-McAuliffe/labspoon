import React from 'react';
import {Formik, Form} from 'formik';
import * as Yup from 'yup';

import {PaddedPageContainer} from '../../components/Layout/Content';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import HeaderAndBodyArticleInput, {
  initialValueNoTitle,
  yupRichBodyOnlyValidation,
} from '../../components/Forms/Articles/HeaderAndBodyArticleInput';
import FormTextInput from '../../components/Forms/FormTextInput';
import {articleTitleValidation} from '../../components/Article/Article';

const validationSchema = Yup.object({
  article: yupRichBodyOnlyValidation(10000, 40),
});

export default function CreateArticlePage() {
  return (
    <PaddedPageContainer>
      <Formik
        initialValues={{
          body: initialValueNoTitle,
          title: articleTitleValidation,
        }}
        validationSchema={validationSchema}
        onSubmit={(vals) => {}}
      >
        <Form>
          <FormTextInput label="Title" name="title" />
          <HeaderAndBodyArticleInput
            name="body"
            shouldAutoFocus={true}
            label="Body"
            minHeight={300}
          />
          <PrimaryButton submit>Submit</PrimaryButton>
        </Form>
      </Formik>
    </PaddedPageContainer>
  );
}
