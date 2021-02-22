import React, {useContext, useEffect, useState} from 'react';
import {Form, Formik} from 'formik';
import firebase from '../../firebase';
import * as Yup from 'yup';
import FormTextInput, {FormTextArea} from '../Forms/FormTextInput';
import FormDateInput from '../Forms/FormDateInput';
import TagTopics, {handlePostTopics} from '../Topics/TagTopics';
import CreateResourceFormActions from '../Forms/CreateResourceFormActions';
import {DropdownOption} from '../Dropdown';
import {AuthContext} from '../../App';
import {WebsiteIcon, EmailIcon} from '../../assets/PostOptionalTagsIcons';
import TabbedContainer from '../TabbedContainer/TabbedContainer';
import {useHistory, useParams} from 'react-router-dom';
import SelectGroup from '../Group/SelectGroup';
import {
  MustSelectGroup,
  SelectedGroup,
  SelectGroupLabel,
} from '../Forms/Groups/SelectGroup';
import GeneralError from '../GeneralError';
import {convertGroupToGroupRef} from '../../helpers/groups';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import {getUserGroups} from '../../helpers/users';

import './CreateOpenPosition.css';
import Select, {LabelledDropdownContainer} from '../Forms/Select/Select';

const POSITIONS = ['Masters', 'Phd', 'Post Doc'];

const createOpenPosition = firebase
  .functions()
  .httpsCallable('openPositions-createOpenPosition');

export default function CreateOpenPosition() {
  const preSelectedGroupID = useParams().groupID;
  const [selectedGroup, setSelectedGroup] = useState(undefined);
  const [memberOfGroups, setMemberOfGroups] = useState([]);
  const [loadingMemberOfGroups, setLoadingMemberOfGroups] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState(false);
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const {user, authLoaded} = useContext(AuthContext);
  const userID = user.uid;

  const onSubmit = (res) => {
    setSubmitting(true);
    const {customTopics, DBTopics} = handlePostTopics(selectedTopics);
    res.customTopics = customTopics;
    res.topics = DBTopics;
    res.group = convertGroupToGroupRef(selectedGroup);
    createOpenPosition(res)
      .then(() => {
        setSubmitting(false);
        history.push(`/group/${selectedGroup.id}`);
      })
      .catch((err) => {
        console.log(err);
        alert(
          'Something went wrong trying to create the open position. Sorry about that. Please try again later.'
        );
        setSubmitting(false);
        history.push(`/group/${selectedGroup.id}`);
      });
  };

  useEffect(() => {
    setLoadingMemberOfGroups(true);
    if (!userID) return;
    getUserGroups(userID)
      .then((groups) => {
        setMemberOfGroups(groups);
        setLoadingMemberOfGroups(false);
        setLoading(false);
        if (preSelectedGroupID)
          setSelectedGroup(
            groups.filter(
              (fetchedGroup) => fetchedGroup.id === preSelectedGroupID
            )[0]
          );
      })
      .catch((err) => {
        console.error(
          `could not fetch groups for user ID ${userID} from db`,
          err
        );
        setPageError(true);
      });
  }, [userID, preSelectedGroupID]);

  const initialValues = {
    title: '',
    address: '',
    salary: '',
    startDate: '',
    applyEmail: '',
    applyLink: '',
    description: '',
    position: '',
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('You need to provide a title.'),
    description: Yup.string()
      .required('You need to write a description.')
      .max(
        7000,
        'The description is too long. It must have fewer than 7000 characters.'
      ),
    address: Yup.string(),
    salary: Yup.string(),
    startDate: Yup.string(),
    applyEmail: Yup.string()
      .test(
        'one-apply-method',
        'You need to provide a link or email for applications',
        function (value) {
          // eslint-disable-next-line no-invalid-this
          if (this.parent.applyLink || value) return true;
        }
      )
      .email('Must be a valid email address'),
    applyLink: Yup.string()
      .test(
        'one-apply-method',
        'You need to provide a link or email for applications',
        function (value) {
          // eslint-disable-next-line no-invalid-this
          if (this.parent.applyEmail || value) return true;
        }
      )
      .url('Must be a valid url'),
    position: Yup.mixed().oneOf(POSITIONS),
  });

  if (pageError) return <GeneralError />;

  if (loadingMemberOfGroups || !authLoaded) return <LoadingSpinner />;

  if (selectedGroup === undefined)
    return (
      <>
        <SelectGroupLabel fieldName="Group">
          <SelectGroup
            groups={memberOfGroups}
            setSelectedGroup={setSelectedGroup}
            toggleText="Select from your groups"
            loading={loading}
          />
        </SelectGroupLabel>
        <MustSelectGroup
          userHasGroups={memberOfGroups.length > 0}
          explanation="Open positions can only be created for groups."
        />
      </>
    );
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {(props) => (
        <Form>
          {submitting && (
            <div className="article-submitting-overlay">
              <LoadingSpinner />
            </div>
          )}
          <SelectedGroup
            groups={memberOfGroups}
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
          />
          <FormTextInput name="title" label="Title" />
          <SelectPosition name="position" {...props} />
          <FormTextArea height="100px" name="address" label="Address" />
          <FormTextInput name="salary" label="Salary" />
          <FormDateInput sideLabel={true} name="startDate" label="Start Date" />
          <FormTextArea height="300px" name="description" label="Description" />
          <TagTopics
            submittingForm={submitting}
            selectedTopics={selectedTopics}
            setSelectedTopics={setSelectedTopics}
          />
          <h4>How to Apply</h4>
          <HowToApply />
          <CreateResourceFormActions
            submitted={submitting}
            submitText="Create"
          />
        </Form>
      )}
    </Formik>
  );
}

function SelectPosition({...props}) {
  return (
    <LabelledDropdownContainer label="Position">
      <Select {...props}>{getPositionTypes()}</Select>
    </LabelledDropdownContainer>
  );
}

function getPositionTypes() {
  return POSITIONS.map((position) => (
    <DropdownOption key={position} value={position} text={position}>
      <h4 className="create-open-position-types-dropdown-option">{position}</h4>
    </DropdownOption>
  ));
}

function HowToApply() {
  const tabDetails = [
    {
      name: 'Apply through link',
      icon: <WebsiteIcon />,
      contents: <FormTextInput placeholder="Website url" name="applyLink" />,
    },
    {
      name: 'Apply By Email',
      icon: <EmailIcon />,
      contents: (
        <div>
          <FormTextInput placeholder="Email Address" name="applyEmail" />
        </div>
      ),
    },
  ];
  return <TabbedContainer tabDetails={tabDetails} />;
}
