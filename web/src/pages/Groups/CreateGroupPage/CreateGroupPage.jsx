import React from 'react';
import {useContext} from 'react';
import {Formik, Form} from 'formik';
import * as Yup from 'yup';

import {db} from '../../../firebase';

import {FeatureFlags} from '../../../App';
import FormTextInput from '../../../components/Forms/FormTextInput';
import FormTextArea from '../../../components/Forms/FormTextInput';
import SubmitButton from '../../../components/Buttons/SubmitButton';
import {useHistory} from 'react-router-dom';

export default function CreateGroupPage() {
  const featureFlags = useContext(FeatureFlags);
  const history = useHistory();

  if (!featureFlags.has('create-group')) {
    return <></>;
  }

  const initialValues = {
    name: '',
    location: '',
    institution: '',
    website: '',
    avatar: '',
    about: '',
  };
  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    location: Yup.string(),
    institution: Yup.string(),
    website: Yup.string(),
    avatar: Yup.string(),
    about: Yup.string(),
  });
  function onSubmit(values) {
    db.collection('groups')
      .add({
        name: values.name,
        location: values.location,
        institution: values.institution,
        website: values.website,
        avatar: values.avatar,
        about: values.about,
      })
      .then((docRef) => history.push(`/group/${docRef.id}`))
      .catch((err) => alert(err));
  }

  return (
    <div className="content-layout">
      <h1>Create Group</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        <Form>
          <FormTextInput label="Name" name="name" sideLabel />
          <FormTextInput label="Location" name="location" sideLabel />
          <FormTextInput label="Institution" name="institution" sideLabel />
          <FormTextInput label="Website" name="website" sideLabel />
          <FormTextInput label="Avatar" name="avatar" sideLabel />
          <FormTextArea label="About" name="about" sideLabel />
          <SubmitButton inputText="Submit" />
        </Form>
      </Formik>
    </div>
  );
}
