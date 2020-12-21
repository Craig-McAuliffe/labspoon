import React, {useContext, useEffect, useState} from 'react';
import {Form, Formik} from 'formik';
import firebase from '../../firebase';
import * as Yup from 'yup';
import FormTextInput, {FormTextArea} from '../Forms/FormTextInput';
import FormDateInput from '../Forms/FormDateInput';
import TagTopics, {handlePostTopics} from '../Topics/TagTopics';
import CreateResourceFormActions from '../Forms/CreateResourceFormActions';
import Dropdown, {DropdownOption} from '../Dropdown';
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

import './CreateOpenPosition.css';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import {getUserGroups} from '../../helpers/users';

const POSITIONS = ['Masters', 'Phd', 'Post Doc'];

const createOpenPosition = firebase
  .functions()
  .httpsCallable('openPositions-createOpenPosition');

export default function CreateOpenPosition() {
  const preSelectedGroupID = useParams().groupID;
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(undefined);
  const [memberOfGroups, setMemberOfGroups] = useState([]);
  const [loadingMemberOfGroups, setLoadingMemberOfGroups] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState(false);
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const {userProfile} = useContext(AuthContext);
  const userID = userProfile.id;

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
  }, [userID]);

  const initialValues = {
    title: '',
    address: '',
    salary: '',
    startDate: '',
    applyEmail: '',
    applyLink: '',
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('You need to provide a title.'),
    description: Yup.string().required('You need to write a description.'),
    address: Yup.string(),
    salary: Yup.string(),
    startDate: Yup.string(),
    applyEmail: Yup.string().test(
      'one-apply-method',
      'You need to provide a link or email for applications',
      function (value) {
        // eslint-disable-next-line no-invalid-this
        if (this.parent.applyLink || value) return true;
      }
    ),
    applyLink: Yup.string().test(
      'one-apply-method',
      'You need to provide a link or email for applications',
      function (value) {
        // eslint-disable-next-line no-invalid-this
        if (this.parent.applyEmail || value) return true;
      }
    ),
  });

  if (pageError) return <GeneralError />;

  if (loadingMemberOfGroups) return <LoadingSpinner />;

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
      <Form>
        <SelectedGroup
          groups={memberOfGroups}
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
        />
        <FormTextInput name="title" label="Title" />
        <SelectPosition
          selectedPosition={selectedPosition}
          setSelectedPosition={setSelectedPosition}
        />
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
        <CreateResourceFormActions submitted={submitting} submitText="Create" />
      </Form>
    </Formik>
  );
}

function SelectPosition({selectedPosition, setSelectedPosition}) {
  return (
    <div className="dropdown-positioning">
      <h4 className="open-position-dropdown-label">Position</h4>
      <div className="open-position-dropdown-container">
        <Dropdown
          customToggleTextOnly={selectedPosition}
          containerTopPosition="40px"
        >
          {getPositionTypes(setSelectedPosition)}
        </Dropdown>
      </div>
    </div>
  );
}

function getPositionTypes(setSelectedPosition) {
  return POSITIONS.map((position) => (
    <DropdownOption
      key={position}
      onSelect={() => {
        setSelectedPosition(position);
      }}
    >
      <h4 className="create-open-position-types-dropdown-option">{position}</h4>
    </DropdownOption>
  ));
}

function HowToApply() {
  const tabDetails = [
    {
      name: 'Apply through link',
      icon: <WebsiteIcon />,
      contents: <FormTextInput placeholder="Website url" name="applyEmail" />,
    },
    {
      name: 'Apply By Email',
      icon: <EmailIcon />,
      contents: (
        <div>
          <FormTextInput placeholder="Email Address" name="applyLink" />
        </div>
      ),
    },
  ];
  return <TabbedContainer tabDetails={tabDetails} />;
}
