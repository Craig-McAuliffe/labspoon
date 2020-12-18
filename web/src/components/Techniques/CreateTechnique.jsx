import React, {useContext, useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';
import {Form, Formik, useField} from 'formik';
import * as Yup from 'yup';
import {AuthContext} from '../../App';
import SelectGroup from '../Group/SelectGroup';
import {
  MustSelectGroup,
  SelectedGroup,
  SelectGroupLabel,
} from '../Forms/Groups/SelectGroup';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import {getUserGroups} from '../../helpers/users';
import HeaderAndBodyArticleInput, {
  getTitleTextAndBody,
  initialValue,
  yupArticleValidation,
} from '../Forms/Articles/HeaderAndBodyArticleInput';
import TagTopics, {handlePostTopics} from '../Topics/TagTopics';
import CreateResourceFormActions from '../Forms/CreateResourceFormActions';
import {ImagePreviews, SelectImages} from '../Images/ImageUpload';
import NegativeButton from '../Buttons/NegativeButton';
import {db} from '../../firebase';
import {convertGroupToGroupRef} from '../../helpers/groups';
import {uploadImagesAndGetURLs} from '../../helpers/images';

export default function CreateTechnique() {
  const [selectedGroup, setSelectedGroup] = useState(undefined);
  const [memberOfGroups, setMemberOfGroups] = useState([]);
  const [loadingMemberOfGroups, setLoadingMemberOfGroups] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const {userProfile} = useContext(AuthContext);
  const history = useHistory();
  const userID = userProfile.id;

  useEffect(() => {
    setLoadingMemberOfGroups(true);
    if (!userID) return;
    getUserGroups(userID)
      .then((groups) => {
        setMemberOfGroups(groups);
        setLoadingMemberOfGroups(false);
      })
      .catch((err) => {
        console.error(
          `could not fetch groups for user ID ${userID} from db`,
          err
        );
        setMemberOfGroups([
          "We cannot fetch your groups at the moment. We'll look into it. Please try again later.",
        ]);
      });
  }, [userID]);

  if (loadingMemberOfGroups || submitting) return <LoadingSpinner />;

  if (selectedGroup === undefined)
    return (
      <>
        <SelectGroupLabel fieldName="Research Group">
          <SelectGroup
            groups={memberOfGroups}
            setSelectedGroup={setSelectedGroup}
            toggleText="Select from your groups"
          />
        </SelectGroupLabel>
        <MustSelectGroup
          userHasGroups={memberOfGroups.length > 0}
          explanation="Techniques can only be created for groups."
        />
      </>
    );

  function onSubmit(res) {
    setSubmitting(true);
    const techniqueDBRef = db
      .collection(`groups/${selectedGroup.id}/techniques`)
      .doc();
    const techniqueID = techniqueDBRef.id;

    if (res.photos.length === 0) {
      addTechniqueToDB(
        res,
        [],
        selectedTopics,
        selectedGroup,
        userProfile,
        techniqueDBRef,
        setSubmitting,
        history
      );
      return;
    }
    uploadImagesAndGetURLs(
      Array.from(res.photos),
      `groups/${selectedGroup.id}/techniques/${techniqueID}`
    ).then((photoURLs) =>
      addTechniqueToDB(
        res,
        photoURLs,
        selectedTopics,
        selectedGroup,
        userProfile,
        techniqueDBRef,
        setSubmitting,
        history
      )
    );
  }

  return (
    <Formik
      initialValues={{
        technique: initialValue,
        photos: [],
      }}
      validationSchema={Yup.object({
        technique: yupArticleValidation,
      })}
      onSubmit={onSubmit}
    >
      <Form>
        <SelectedGroup
          groups={memberOfGroups}
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
        />
        <HeaderAndBodyArticleInput name="technique" />
        <TagTopics
          submittingForm={submitting}
          selectedTopics={selectedTopics}
          setSelectedTopics={setSelectedTopics}
        />
        <TechniqueImageUpload name="photos" />
        <CreateResourceFormActions
          submitting={submitting}
          submitText="Create Technique"
        />
      </Form>
    </Formik>
  );
}

function addTechniqueToDB(
  results,
  photoURLs,
  selectedTopics,
  selectedGroup,
  author,
  techniqueDBRef,
  setSubmitting,
  history
) {
  const technique = {};
  const {customTopics, DBTopics} = handlePostTopics(selectedTopics);
  technique.customTopics = customTopics;
  technique.topics = DBTopics;
  technique.group = convertGroupToGroupRef(selectedGroup);
  technique.photoURLs = photoURLs;
  technique.author = author;
  const [title, body] = getTitleTextAndBody(results.technique);
  technique.title = title;
  technique.body = body;
  techniqueDBRef
    .set(technique)
    .then(() => {
      setSubmitting(false);
      history.push(`/groups/${selectedGroup.id}`);
    })
    .catch((err) => {
      console.error(err);
      alert(
        'Something went wrong trying to create the technique. Sorry about that. Please try again later.'
      );
      setSubmitting(false);
    });
}

function TechniqueImageUpload({...props}) {
  const [field, , helpers] = useField(props);
  const [urls, setURLs] = useState([]);
  const imageFiles = field.value;

  useEffect(() => {
    if (!imageFiles) return;
    setURLs(Array.from(imageFiles).map((file) => URL.createObjectURL(file)));
    return () => {
      urls.map((url) => URL.revokeObjectURL(url));
      setURLs([]);
    };
  }, [imageFiles]);

  function onChange(e) {
    helpers.setValue(e.target.files);
  }

  if (!imageFiles || imageFiles.length === 0) {
    return <SelectImages onChange={onChange} />;
  }

  return (
    <>
      <ImagePreviews urls={urls} />
      <NegativeButton onClick={() => helpers.setValue([])}>
        Cancel
      </NegativeButton>
    </>
  );
}
