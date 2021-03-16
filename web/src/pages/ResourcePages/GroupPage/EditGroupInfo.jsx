import React, {useState, useEffect} from 'react';
import {EditInfo} from '../../../components/Group/CreateGroupPage/GroupInfoForm';
import {db} from '../../../firebase';
import {useHistory} from 'react-router-dom';
import {PaddedPageContainer} from '../../../components/Layout/Content';
import {LoadingSpinnerPage} from '../../../components/LoadingSpinner/LoadingSpinner';
import {Form, Formik} from 'formik';
import * as Yup from 'yup';
import CreateResourceFormActions from '../../../components/Forms/CreateResourceFormActions';
import {
  initialValueNoTitle,
  yupRichBodyOnlyValidation,
} from '../../../components/Forms/Articles/HeaderAndBodyArticleInput';

import './GroupPage.css';

export default function EditingGroupInfo({groupData, children}) {
  const groupID = groupData.id;
  const [verified, setVerified] = useState(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
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
    db.doc(`verifiedGroups/${groupID}`)
      .get()
      .then((ds) => setVerified(ds.exists))
      .catch((err) => alert(err));
  }, [groupID]);

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
      .max(500, 'Must have fewer than 500 characters'),
    location: Yup.string(),
    institution: Yup.string(),
    website: Yup.string().url('Must be a valid url'),
    about: yupRichBodyOnlyValidation(4000, 15),
    donationLink: Yup.string().url('Must be a valid url'),
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
        history.push(`/group/${groupID}`);
      });
  };

  if (submitting) return <LoadingSpinnerPage />;
  return (
    <PaddedPageContainer>
      {children}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmitInfo}
      >
        {(props) => (
          <Form>
            <EditInfo
              verified={verified}
              groupType={groupData.groupType}
              {...props}
            />
            <CreateResourceFormActions
              submitText="Submit"
              submitting={submitting}
            />
          </Form>
        )}
      </Formik>
    </PaddedPageContainer>
  );
}
