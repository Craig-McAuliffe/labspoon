import React, {useContext, useEffect, useState} from 'react';
import {Form, Formik} from 'formik';
import * as Yup from 'yup';
import FormTextInput, {FormTextArea} from '../Forms/FormTextInput';
import FormDateInput from '../Forms/FormDateInput';
import GroupListItem, {GroupDropdownItem} from '../Group/GroupListItem';
import TagTopics from '../Posts/Post/CreatePost/TagTopics';
// import {handlePostTopics} from '../Posts/Post/CreatePost/PostForm';
import CreateResourceFormActions from '../Forms/CreateResourceFormActions';
import Dropdown, {DropdownOption} from '../Dropdown';
import {AuthContext} from '../../App';
import {db} from '../../firebase';
import NegativeButton from '../Buttons/NegativeButton';
import {WebsiteIcon, EmailIcon} from '../../assets/PostOptionalTagsIcons';

import './CreateOpenPosition.css';
import TabbedContainer from '../TabbedContainer/TabbedContainer';

const POSITIONS = ['Masters', 'Phd', 'Post Doc'];

export default function CreateOpenPosition() {
  const [selectingPosition, setSelectingPosition] = useState(false);
  const [selectingGroup, setSelectingGroup] = useState(false);
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

  const initialValues = {
    title: '',
    position: '',
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('You need to write something!'),
    position: Yup.string().required(
      'You need to provide a link to the publication'
    ),
  });

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

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      <Form>
        <FormTextInput name="title" label="Title" />
        <div className="dropdown-positioning">
          <h4 className="open-position-dropdown-label">Position</h4>
          <div className="open-position-dropdown-container">
            <Dropdown
              openDropdown={selectingPosition}
              setOpenDropdown={setSelectingPosition}
              customToggleTextOnly={selectedPosition}
              containerTopPosition="40px"
            >
              {positionTypes(setSelectedPosition, setSelectingPosition)}
            </Dropdown>
          </div>
        </div>
        <h4>Location</h4>
        <FormTextInput
          name="address-line-1"
          sideLabel={true}
          label="1st line address"
        />
        <FormTextInput
          name="address-line-2"
          sideLabel={true}
          label="1st line address"
        />
        <FormTextInput
          name="address-city"
          sideLabel={true}
          label="1st line address"
        />
        <FormTextInput
          name="address-country"
          sideLabel={true}
          label="1st line address"
        />
        <FormTextInput
          name="address-post-code"
          sideLabel={true}
          label="1st line address"
        />
        <FormTextInput name="salary" label="1st line address" />
        <FormDateInput sideLabel={true} name="start-date" label="Start Date" />
        {selectedGroup === undefined ? (
          <div className="open-position-group-dropdown">
            <h4 className="open-position-dropdown-label">Research Group</h4>
            <Dropdown
              customToggleWidth="100%"
              customToggleTextOnly="Select from your groups"
              openDropdown={selectingGroup}
              setOpenDropdown={setSelectingGroup}
              containerTopPosition="40px"
            >
              <MemberOfGroupsDropdownOptions
                memberOfGroups={memberOfGroups}
                setSelectedGroup={setSelectedGroup}
                setSelectingGroup={setSelectingGroup}
              />
            </Dropdown>
          </div>
        ) : (
          <GroupListItem group={selectedGroup}>
            <NegativeButton onClick={() => setSelectedGroup(undefined)}>
              Remove
            </NegativeButton>
          </GroupListItem>
        )}
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

function MemberOfGroupsDropdownOptions({
  memberOfGroups,
  setSelectedGroup,
  setSelectingGroup,
}) {
  return memberOfGroups.map((group) => (
    <DropdownOption
      key={group.id}
      onSelect={() => {
        setSelectingGroup(false);
        setSelectedGroup(group);
      }}
    >
      <GroupDropdownItem group={group} />
    </DropdownOption>
  ));
}

function positionTypes(setSelectedPosition, setSelectingPosition) {
  return POSITIONS.map((position) => (
    <DropdownOption
      key={position}
      onSelect={() => {
        setSelectedPosition(position);
        setSelectingPosition(false);
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
            onChange={(e) => handleApplyInput(e, EMAIL)}
          />
        </div>
      ),
    },
  ];
  return <TabbedContainer tabDetails={tabDetails} />;
}
