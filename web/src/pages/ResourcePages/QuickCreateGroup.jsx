import React, {useState, useContext, useEffect} from 'react';
import {Formik, Form} from 'formik';
import FormTextInput from '../../components/Forms/FormTextInput';
import {PaddedPageContainer} from '../../components/Layout/Content';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import * as Yup from 'yup';
import HeaderAndBodyArticleInput, {
  initialValueNoTitle,
  yupRichBodyOnlyValidation,
} from '../../components/Forms/Articles/HeaderAndBodyArticleInput';
import {v4 as uuid} from 'uuid';
import {LabspoonLogoAndName} from '../../assets/AboutPageIcons';
import {submitSignUp} from '../LoginSignup/SignupPage/SignupPage';
import {LoadingSpinnerPage} from '../../components/LoadingSpinner/LoadingSpinner';
import firebase, {db} from '../../firebase';
import {RESEARCH_GROUP} from '../../components/Group/CreateGroupPage/GroupInfoForm';
import {Redirect, useHistory} from 'react-router';
import {GROUP} from '../../helpers/resourceTypeDefinitions';
import {AuthContext} from '../../App';
import useScript from '../../helpers/useScript';
import useDomRemover from '../../helpers/useDomRemover';
import {reCaptchaSiteKey} from '../../config';

import './QuickCreateGroup.css';

export default function QuickCreateGroup() {
  const [submitting, setSubmitting] = useState(false);
  const [savedValues, setSavedValues] = useState(false);
  const [blockRedirect, setBlockRedirect] = useState(false);
  const {updateUserDetails, user} = useContext(AuthContext);
  const history = useHistory();

  useScript(
    `https://www.google.com/recaptcha/api.js?render=${reCaptchaSiteKey}`
  );

  useDomRemover('.grecaptcha-badge');

  // prevents redirect after creating user
  useEffect(() => {
    if (!user) setBlockRedirect(true);
  }, []);

  const initialValues = savedValues
    ? savedValues
    : {
        groupName: '',
        about: initialValueNoTitle,
        email: '',
        userName: '',
      };

  const validationSchema = Yup.object({
    groupName: Yup.string()
      .required('You need to write a group name')
      .max(500, 'Must have fewer than 500 characters'),
    about: yupRichBodyOnlyValidation(4000, 15),
    email: Yup.string()
      .required('Please enter your email address')
      .email('Please enter a valid email')
      .max(
        200,
        'Email address is too long. It must have fewer than 200 characters.'
      ),
    userName: Yup.string()
      .required('Please enter your name')
      .max(
        150,
        'Username is too long. It must have fewer than 150 characters.'
      ),
  });

  if (user && !blockRedirect) return <Redirect to="/" />;
  if (submitting) return <LoadingSpinnerPage />;
  return (
    <PaddedPageContainer>
      <h2 className="quick-create-group-title">
        Create a Labspoon group and profile
      </h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) =>
          createGroupAndUser(
            values,
            setSubmitting,
            updateUserDetails,
            setSavedValues,
            history
          )
        }
      >
        {(props) => (
          <Form>
            <>
              <FormTextInput label="Group name" name="groupName" />
              <div className="rich-text-input-area">
                <HeaderAndBodyArticleInput
                  noTitle={true}
                  label="Group description"
                  name="about"
                  {...props}
                  shouldAutoFocus={false}
                />
              </div>
              <FormTextInput label="Your email address" name="email" />
              <FormTextInput
                label="Your full name (displayed on profile)"
                name="userName"
              />
              <div className="quick-create-group-submit-logo-container">
                <PrimaryButton type="submit">
                  Create Labspoon Group
                </PrimaryButton>
                <LabspoonLogoAndName />
              </div>
            </>
          </Form>
        )}
      </Formik>
    </PaddedPageContainer>
  );
}

async function createGroupAndUser(
  values,
  setSubmitting,
  updateUserDetails,
  setSavedValues,
  history
) {
  setSubmitting(true);
  const password = uuid();
  values.password = password;
  return submitSignUp(
    values,
    undefined,
    updateUserDetails,
    setSavedValues
  ).then((isSubmitted) => {
    if (!isSubmitted) {
      setSavedValues(values);
      setSubmitting(false);
      return;
    }
    const newUser = firebase.auth().currentUser;
    const userID = newUser.uid;

    if (!userID) return <Redirect to="/create/group" />;
    const groupData = {
      groupType: RESEARCH_GROUP,
      name: values.groupName,
      location: '',
      institution: '',
      website: '',
      about: values.about,
    };
    const groupDoc = db.collection(`groups`).doc();
    const groupID = groupDoc.id;
    const groupMembersDoc = db.doc(`groups/${groupID}/members/${userID}`);
    const batch = db.batch();
    batch.set(groupDoc, groupData);
    batch.set(groupMembersDoc, {
      name: values.userName,
      id: userID,
    });
    return batch
      .commit()
      .catch((err) => {
        console.error(`unable to create group ${err}`);
      })
      .finally(() =>
        history.push('/generatedPassword', {
          password: password,
          resourceType: GROUP,
          resourceID: groupID,
        })
      );
  });
}
