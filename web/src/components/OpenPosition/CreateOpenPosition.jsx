import React, {useContext, useEffect, useState} from 'react';
import {Form, Formik} from 'formik';
import firebase from '../../firebase';
import * as Yup from 'yup';
import FormTextInput, {FormTextArea} from '../Forms/FormTextInput';
import FormDateInput from '../Forms/FormDateInput';
import {GroupDropdownItem, GroupHeadlineItem} from '../Group/GroupListItem';
import TagTopics, {handlePostTopics} from '../Topics/TagTopics';
import CreateResourceFormActions from '../Forms/CreateResourceFormActions';
import Dropdown, {DropdownOption} from '../Dropdown';
import {AuthContext} from '../../App';
import {db} from '../../firebase';
import {WebsiteIcon, EmailIcon} from '../../assets/PostOptionalTagsIcons';
import TabbedContainer from '../TabbedContainer/TabbedContainer';
import {CreateButton} from '../../assets/HeaderIcons';
import SecondaryButton from '../Buttons/SecondaryButton';
import {Link, useHistory} from 'react-router-dom';
import {DropDownTriangle} from '../../assets/GeneralActionIcons';
import GeneralError from '../GeneralError';
import {convertGroupToGroupRef} from '../../helpers/groups';

import './CreateOpenPosition.css';

const POSITIONS = ['Masters', 'Phd', 'Post Doc'];

const createOpenPosition = firebase
  .functions()
  .httpsCallable('openPositions-createOpenPosition');

export default function CreateOpenPosition() {
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(undefined);
  const [memberOfGroups, setMemberOfGroups] = useState([]);
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
        history.push('/groups/${selectedGroup.id}');
      })
      .catch((err) => {
        console.log(err);
        alert(
          'Something went wrong trying to create the open position. Sorry about that. Please try again later.'
        );
        setSubmitting(false);
        history.push('/groups/${selectedGroup.id}');
      });
  };

  useEffect(() => {
    db.collection(`users/${userID}/groups`)
      .get()
      .then((qs) => {
        setLoading(false);
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

  if (pageError)
    return (
      <GeneralError>
        <h4>
          Something went wrong trying to fetch your groups. We&#39;ll look into
          it. Please try again later.
        </h4>
      </GeneralError>
    );

  if (selectedGroup === undefined)
    return (
      <MandatoryGroupSelection
        memberOfGroups={memberOfGroups}
        setSelectedGroup={setSelectedGroup}
        loading={loading}
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
          submitText="Create Position"
        />
      </Form>
    </Formik>
  );
}

function MandatoryGroupSelection({memberOfGroups, setSelectedGroup, loading}) {
  return (
    <>
      <SelectGroup
        memberOfGroups={memberOfGroups}
        setSelectedGroup={setSelectedGroup}
        loading={loading}
      />
      <div className="mandatory-select-group-container">
        <h3 className="mandatory-select-group-explanation">
          Open positions can only be created for groups.
        </h3>
        {memberOfGroups.length > 0 ? (
          <h3 className="mandatory-select-group-explanation">
            Select one of your groups above before creating the position.
          </h3>
        ) : (
          <>
            <h3 className="mandatory-select-group-explanation">
              Choose a group or...
            </h3>
            <div className="mandatory-select-group-button-container">
              <Link to="/create/group">
                <SecondaryButton>
                  <CreateButton hoverControl={true} />
                  Create Group Now
                </SecondaryButton>
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function SelectGroup({memberOfGroups, setSelectedGroup, loading}) {
  return (
    <div className="open-position-group-dropdown">
      <h4 className="open-position-dropdown-label">Research Group</h4>
      <Dropdown
        customToggleWidth="100%"
        customToggleTextOnly="Select from your groups"
        containerTopPosition="40px"
      >
        {getMemberOfGroupsDropdownOptions(
          memberOfGroups,
          setSelectedGroup,
          loading
        )}
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

function getMemberOfGroupsDropdownOptions(
  memberOfGroups,
  setSelectedGroup,
  loading
) {
  if (loading) return <DropdownOption onSelect={() => {}} loading={true} />;
  if (memberOfGroups.length === 0) return;
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

function HowToApply({}) {
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
