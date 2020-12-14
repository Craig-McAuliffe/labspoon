import React, {useContext, useEffect, useState} from 'react';
import {Form, Formik} from 'formik';
import * as Yup from 'yup';
import FormTextInput, {FormTextArea} from '../Forms/FormTextInput';
import FormDateInput from '../Forms/FormDateInput';
import {GroupDropdownItem, GroupHeadlineItem} from '../Group/GroupListItem';
import TagTopics from '../Posts/Post/CreatePost/TagTopics';
// import {handlePostTopics} from '../Posts/Post/CreatePost/PostForm';
import CreateResourceFormActions from '../Forms/CreateResourceFormActions';
import Dropdown, {DropdownOption} from '../Dropdown';
import {AuthContext} from '../../App';
import {db} from '../../firebase';
import {WebsiteIcon, EmailIcon} from '../../assets/PostOptionalTagsIcons';
import TabbedContainer from '../TabbedContainer/TabbedContainer';
import {CreateButton} from '../../assets/HeaderIcons';
import SecondaryButton from '../Buttons/SecondaryButton';

import './CreateOpenPosition.css';
import {Link} from 'react-router-dom';
import {DropDownTriangle} from '../../assets/GeneralActionIcons';

const POSITIONS = ['Masters', 'Phd', 'Post Doc'];

export default function CreateOpenPosition() {
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(undefined);
  const [memberOfGroups, setMemberOfGroups] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [applyMethod, setApplyMethod] = useState(undefined);

  const {userProfile} = useContext(AuthContext);
  const userID = userProfile.id;

  const onSubmit = () => {
    setSubmitting(true);
    // ignore the line below, it is just to prevent lint error
    console.log(applyMethod);
    // const taggedTopics = handlePostTopics();
  };

  useEffect(() => {
    db.collection(`users/${userID}/groups`)
      .get()
      .then((qs) => {
        if (qs.empty) return;
        qs.forEach((groupDoc) => {
          const fetchedGroup = groupDoc.data();
          fetchedGroup.id = groupDoc.id;
          setMemberOfGroups((currentState) => [...currentState, fetchedGroup]);
        });
      })
      .catch((err) => {
        console.log(
          `could not fetch groups for user ID ${userID} from db`,
          err
        );
        setMemberOfGroups([
          "We cannot fetch your groups at the moment. We'll look into it. Please try again later.",
        ]);
      });
  }, [userID]);

  const initialValues = {
    title: '',
    position: '',
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('You need to provide a title.'),
    position: Yup.string().required('You need to specify the position.'),
    description: Yup.string().required('You need to write a description.'),
    apply: Yup.string().required(
      'You need to provide a link or email for applications'
    ),
  });

  if (selectedGroup === undefined)
    return (
      <MandatoryGroupSelection
        memberOfGroups={memberOfGroups}
        setSelectedGroup={setSelectedGroup}
      />
    );

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      <Form>
        <ChangeGroup
          memberOfGroups={memberOfGroups}
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
        />
        <FormTextInput name="title" label="Title" />
        <SelectPosition
          selectedPosition={selectedPosition}
          setSelectedPosition={setSelectedPosition}
        />
        <h4>Location</h4>
        <FormTextInput
          name="address-line-1"
          sideLabel={true}
          label="1st line address"
        />
        <FormTextInput
          name="address-line-2"
          sideLabel={true}
          label="2nd line address"
        />
        <FormTextInput name="address-city" sideLabel={true} label="City" />
        <FormTextInput
          name="address-country"
          sideLabel={true}
          label="Country"
        />
        <FormTextInput
          name="address-post-code"
          sideLabel={true}
          label="Post Code"
        />
        <FormTextInput name="salary" label="Salary" />
        <FormDateInput sideLabel={true} name="start-date" label="Start Date" />

        <FormTextArea height="300px" name="description" label="Description" />
        <TagTopics
          submittingForm={submitting}
          selectedTopics={selectedTopics}
          setSelectedTopics={setSelectedTopics}
        />
        <h4>How to Apply</h4>
        <HowToApply setApplyMethod={setApplyMethod} />
        <CreateResourceFormActions
          submitted={submitting}
          submitText="Create Position"
        />
      </Form>
    </Formik>
  );
}

function MandatoryGroupSelection({memberOfGroups, setSelectedGroup}) {
  return (
    <>
      <SelectGroup
        memberOfGroups={memberOfGroups}
        setSelectedGroup={setSelectedGroup}
      />
      <div className="mandatory-select-group-container">
        <h3>Open positions can only be created for groups.</h3>
        <h3>Choose a group or...</h3>
        <div className="mandatory-select-group-button-container">
          <Link to="/create/group">
            <SecondaryButton>
              <CreateButton hoverControl={true} />
              Create Group Now
            </SecondaryButton>
          </Link>
        </div>
      </div>
    </>
  );
}

function SelectGroup({memberOfGroups, setSelectedGroup}) {
  return (
    <div className="open-position-group-dropdown">
      <h4 className="open-position-dropdown-label">Research Group</h4>
      <Dropdown
        customToggleWidth="100%"
        customToggleTextOnly="Select from your groups"
        containerTopPosition="40px"
      >
        {getMemberOfGroupsDropdownOptions(memberOfGroups, setSelectedGroup)}
      </Dropdown>
    </div>
  );
}

function ChangeGroup({selectedGroup, setSelectedGroup, memberOfGroups}) {
  return (
    <div className="change-group-section">
      <div className="change-mandatory-group-dropdown-container">
        <Dropdown customToggle={ChangeGroupToggle}>
          {getMemberOfGroupsDropdownOptions(memberOfGroups, setSelectedGroup)}
        </Dropdown>
      </div>
      <div>
        <GroupHeadlineItem group={selectedGroup} />
      </div>
    </div>
  );
}

function ChangeGroupToggle({setOpen}) {
  return (
    <button
      className="change-mandatory-group-toggle"
      type="button"
      onClick={setOpen}
    >
      <p>Change Group</p>
      <DropDownTriangle />
    </button>
  );
}

function getMemberOfGroupsDropdownOptions(memberOfGroups, setSelectedGroup) {
  return memberOfGroups.map((group) => (
    <DropdownOption
      key={group.id}
      onSelect={() => {
        setSelectedGroup(group);
      }}
    >
      <GroupDropdownItem group={group} />
    </DropdownOption>
  ));
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

function HowToApply({setApplyMethod}) {
  const EMAIL = 'email';
  const URL = 'url';
  const handleApplyInput = (e, method) => {
    setApplyMethod({
      method: method,
      value: e.target.value,
    });
  };
  const tabDetails = [
    {
      name: 'Apply through link',
      icon: <WebsiteIcon />,
      contents: (
        <input
          className="open-position-apply-method-input"
          type="text"
          placeholder="Website url"
          name="apply"
          onChange={(e) => handleApplyInput(e, URL)}
        />
      ),
    },
    {
      name: 'Apply By Email',
      icon: <EmailIcon />,
      contents: (
        <div>
          <input
            className="open-position-apply-method-input"
            type="text"
            placeholder="Email Address"
            name="apply"
            onChange={(e) => handleApplyInput(e, EMAIL)}
          />
        </div>
      ),
    },
  ];
  return <TabbedContainer tabDetails={tabDetails} />;
}
