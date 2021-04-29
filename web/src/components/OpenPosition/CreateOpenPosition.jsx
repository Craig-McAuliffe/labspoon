import React, {useContext, useEffect, useState} from 'react';
import {Form, Formik} from 'formik';
import firebase from '../../firebase';
import * as Yup from 'yup';
import FormTextInput, {FormTextArea, TextInput} from '../Forms/FormTextInput';
import FormDateInput from '../Forms/FormDateInput';
import TagTopics from '../Topics/TagTopics';
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
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import {getUserGroups} from '../../helpers/users';

import './CreateOpenPosition.css';
import Select, {LabelledDropdownContainer} from '../Forms/Select/Select';
import HeaderAndBodyArticleInput, {
  CreateRichTextCharacterCount,
  initialValueNoTitle,
  yupRichBodyOnlyValidation,
} from '../Forms/Articles/HeaderAndBodyArticleInput';
import {MAX_ARTICLE_CHARACTERS} from '../Article/Article';

const POSITIONS = ['Masters', 'Phd', 'Post Doc', 'Technician'];

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
  const [savedInitialValues, setSavedInitialValues] = useState({
    title: '',
    address: '',
    salary: '',
    startDate: '',
    applyEmail: '',
    applyLink: '',
    description: initialValueNoTitle,
    position: '',
  });
  const history = useHistory();
  const {user, authLoaded} = useContext(AuthContext);
  const userID = user.uid;

  const onSubmit = (res) => {
    setSubmitting(true);
    res.topics = selectedTopics;
    res.group = convertGroupToGroupRef(selectedGroup);
    createOpenPosition(res)
      .then(() => {
        setSubmitting(false);
        history.push(`/group/${selectedGroup.id}/openPositions`);
      })
      .catch((err) => {
        console.log(err);
        alert(
          'Something went wrong trying to create the open position. Sorry about that. Please try again later.'
        );
        setSubmitting(false);
        setSavedInitialValues(res);
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

  const initialValues = savedInitialValues;

  const validationSchema = Yup.object({
    title: Yup.string()
      .required('You need to provide a title.')
      .max(
        100,
        'The title is too long. It must be no longer than 100 characters.'
      ),
    description: yupRichBodyOnlyValidation(MAX_ARTICLE_CHARACTERS, 40),
    address: Yup.string().max(
      100,
      'Too long. It must be no longer than 100 characters.'
    ),
    salary: Yup.string().max(
      15,
      'Too long. It must be no longer than 15 characters.'
    ),
    startDate: Yup.string().max(
      15,
      'Too long. It must be no longer than 15 characters.'
    ),
    applyEmail: Yup.string()
      .test(
        'one-apply-method',
        'You need to provide a link or email for applications',
        function (value) {
          // eslint-disable-next-line no-invalid-this
          if (this.parent.applyLink || value) return true;
        }
      )
      .email('Must be a valid email address')
      .max(100, 'Too long. It must be no longer than 100 characters.'),
    applyLink: Yup.string()
      .test(
        'one-apply-method',
        'You need to provide a link or email for applications',
        function (value) {
          // eslint-disable-next-line no-invalid-this
          if (this.parent.applyEmail || value) return true;
        }
      )
      .url('Must be a valid url')
      .max(200, 'Too long. It must be no longer than 200 characters.'),
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
        <div className="create-open-pos-must-select-group-section">
          <MustSelectGroup
            userHasGroups={memberOfGroups.length > 0}
            explanation="Open positions can only be created for groups."
          />
        </div>
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
          <HeaderAndBodyArticleInput
            name="description"
            noTitle={true}
            label="Description"
            minHeight={300}
          />
          <CreateRichTextCharacterCount
            name="description"
            maxCount={MAX_ARTICLE_CHARACTERS}
          />
          <TagTopics
            submittingForm={submitting}
            selectedTopics={selectedTopics}
            setSelectedTopics={setSelectedTopics}
            noCustomTopics={true}
          />
          <h4>How to Apply</h4>
          <HowToApply />
          <CreateResourceFormActions
            submitting={submitting}
            submitText="Create"
          />
        </Form>
      )}
    </Formik>
  );
}

export function SelectPosition({nonForm, onSelect, ...props}) {
  if (nonForm) return <Dropdown>{getPositionTypes(onSelect)}</Dropdown>;
  return (
    <LabelledDropdownContainer label="Position">
      <Select {...props}>{getPositionTypes()}</Select>
    </LabelledDropdownContainer>
  );
}

function getPositionTypes(onSelect) {
  return POSITIONS.map((position) => (
    <DropdownOption
      onSelect={onSelect}
      key={position}
      value={position}
      text={position}
    >
      <h4 className="create-open-position-types-dropdown-option">{position}</h4>
    </DropdownOption>
  ));
}

export function HowToApply({nonForm, nonFormAction}) {
  const tabDetails = [
    {
      name: 'Apply through link',
      icon: <WebsiteIcon />,
      contents: nonForm ? (
        <TextInput name="applyLink" onChange={(e) => nonFormAction(e)} />
      ) : (
        <FormTextInput placeholder="Website url" name="applyLink" />
      ),
    },
    {
      name: 'Apply By Email',
      icon: <EmailIcon />,
      contents: nonForm ? (
        <div>
          <TextInput name="applyEmail" onChange={(e) => nonFormAction(e)} />{' '}
        </div>
      ) : (
        <div>
          <FormTextInput placeholder="Email Address" name="applyEmail" />
        </div>
      ),
    },
  ];
  return <TabbedContainer tabDetails={tabDetails} />;
}
