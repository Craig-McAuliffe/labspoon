import React, {useState, useEffect} from 'react';
import {EditInfo} from '../../../components/Group/CreateGroupPage/GroupInfoForm';
import {db} from '../../../firebase';
import {PaddedPageContainer} from '../../../components/Layout/Content';
import {LoadingSpinnerPage} from '../../../components/LoadingSpinner/LoadingSpinner';
import {Form, Formik} from 'formik';
import * as Yup from 'yup';
import CreateResourceFormActions from '../../../components/Forms/CreateResourceFormActions';
import {
  initialValueNoTitle,
  yupRichBodyOnlyValidation,
} from '../../../components/Forms/Articles/HeaderAndBodyArticleInput';
import SuccessMessage from '../../../components/Forms/SuccessMessage';
import {useHistory} from 'react-router';

import './GroupPage.css';

export default function EditingGroupInfo({groupData, children}) {
  const groupID = groupData.id;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [successfulSubmit, setSuccessfulSubmit] = useState(false);
  const history = useHistory();

  useEffect(() => {
    if (error) {
      alert(
        'Something went wrong while editing the group. Please try again. If the problem persists, please let us know on the contact page.'
      );
      setError(false);
    }
  }, [error, setError]);

  useEffect(() => {
    if (!successfulSubmit) return;
    const successTimeout = setTimeout(() => setSuccessfulSubmit(false), 3000);
    return () => clearTimeout(successTimeout);
  }, [successfulSubmit]);

  const initialValues = {
    name: groupData.name ? groupData.name : '',
    location: groupData.location ? groupData.location : '',
    institution: groupData.institution ? groupData.institution : '',
    website: groupData.website ? groupData.website : '',
    about: groupData.about ? groupData.about : initialValueNoTitle,
  };
  if (groupData.donationLink)
    initialValues.donationLink = groupData.donationLink;

  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Name is required')
      .max(50, 'Must have fewer than 50 characters'),
    location: Yup.string().max(50, 'Must have fewer than 50 characters'),
    institution: Yup.string().max(50, 'Must have fewer than 50 characters'),
    website: Yup.string()
      .url('Must be a valid url')
      .max(200, 'Must have fewer than 200 characters'),
    about: yupRichBodyOnlyValidation(4000, 15),
    donationLink: Yup.string()
      .url('Must be a valid url')
      .max(200, 'Must have fewer than 200 characters'),
  });

  const onSubmitInfo = async (values) => {
    setSubmitting(true);
    const groupDocRef = db.doc(`groups/${groupID}`);
    const setToDB = groupDocRef.update(values);
    setToDB
      .catch((err) => {
        console.error('edit group batch failed', err);
        setSubmitting(false);
        setError(true);
      })
      .then(() => {
        setSubmitting(false);
        setSuccessfulSubmit(true);
      });
  };

  if (submitting) return <LoadingSpinnerPage />;
  return (
    <PaddedPageContainer>
      {children}
      {successfulSubmit && (
        <SuccessMessage isOverlay={true}>Successfully saved</SuccessMessage>
      )}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmitInfo}
      >
        {(props) => (
          <Form>
            <EditInfo
              verified={groupData.isVerified}
              groupType={groupData.groupType}
              {...props}
            />
            <CreateResourceFormActions
              submitText="Submit"
              submitting={submitting}
              cancelForm={() => history.push(`/group/${groupID}`)}
            />
          </Form>
        )}
      </Formik>
    </PaddedPageContainer>
  );
}
