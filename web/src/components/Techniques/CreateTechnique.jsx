import React, {useContext, useEffect, useState} from 'react';
import {useHistory, useParams} from 'react-router-dom';
import {Form, Formik} from 'formik';
import * as Yup from 'yup';
import {AuthContext} from '../../App';
import SelectGroup from '../Group/SelectGroup';
import {
  MustSelectGroup,
  SelectedGroup,
  SelectGroupLabel,
} from '../Forms/Groups/SelectGroup';
import LoadingSpinner, {
  LoadingSpinnerPage,
} from '../LoadingSpinner/LoadingSpinner';
import {getUserGroups} from '../../helpers/users';
import HeaderAndBodyArticleInput, {
  initialValue,
  yupArticleValidation,
} from '../Forms/Articles/HeaderAndBodyArticleInput';
import TagTopics from '../Topics/TagTopics';
import CreateResourceFormActions from '../Forms/CreateResourceFormActions';
import {db} from '../../firebase';
import FormImageUpload from '../Images/FormImageUpload';
import addArticleToDB from '../../helpers/articles';
import {TECHNIQUES} from '../../helpers/resourceTypeDefinitions';
import {uploadImagesAndGetURLs} from '../../helpers/images';

export default function CreateTechnique() {
  const preSelectedGroupID = useParams().groupID;
  const [selectedGroup, setSelectedGroup] = useState(undefined);
  const [memberOfGroups, setMemberOfGroups] = useState([]);
  const [loadingMemberOfGroups, setLoadingMemberOfGroups] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [savedInitialValues, setSavedInitialValues] = useState({
    technique: initialValue,
    photos: [],
  });
  const {userProfile, authLoaded, user} = useContext(AuthContext);
  const history = useHistory();
  if (!authLoaded) return <LoadingSpinnerPage />;
  const userID = user.uid;

  useEffect(() => {
    setLoadingMemberOfGroups(true);
    if (!userID) return;
    getUserGroups(userID)
      .then((groups) => {
        setMemberOfGroups(groups);
        setLoadingMemberOfGroups(false);
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
        setMemberOfGroups([
          "We cannot fetch your groups at the moment. We'll look into it. Please try again later.",
        ]);
      });
  }, [userID, preSelectedGroupID]);

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
    const techniqueDBRef = db.collection(`techniques`).doc();
    const techniqueID = techniqueDBRef.id;
    const failFunction = () =>
      setSavedInitialValues({technique: res.technique, photos: res.photos});
    if (res.photos.length === 0) {
      addArticleToDB(
        res.technique,
        [],
        selectedTopics,
        selectedGroup,
        userProfile,
        techniqueDBRef,
        setSubmitting,
        history,
        TECHNIQUES,
        'techniquesCount',
        failFunction
      );
      return;
    }
    uploadImagesAndGetURLs(
      Array.from(res.photos),
      `groups/${selectedGroup.id}/techniques/${techniqueID}`
    ).then((fullSizePhotoURLs) => {
      if (!fullSizePhotoURLs) {
        alert('Something went wrong, please try again');
        failFunction();
        setSubmitting(false);
        return;
      }
      const resizedPhotoURLs = fullSizePhotoURLs.map((fullSizeURL) =>
        fullSizeURL.replace('_fullSize', '')
      );
      addArticleToDB(
        res.technique,
        resizedPhotoURLs,
        selectedTopics,
        selectedGroup,
        userProfile,
        techniqueDBRef,
        setSubmitting,
        history,
        TECHNIQUES,
        'techniquesCount',
        failFunction
      );
    });
    return;
  }
  return (
    <Formik
      initialValues={savedInitialValues}
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
        <HeaderAndBodyArticleInput name="technique" shouldAutoFocus={true} />
        <TagTopics
          submittingForm={submitting}
          selectedTopics={selectedTopics}
          setSelectedTopics={setSelectedTopics}
          noCustomTopics={true}
        />
        <FormImageUpload name="photos" multiple={true} maxImages={9} />
        <CreateResourceFormActions
          submitting={submitting}
          submitText="Create"
        />
      </Form>
    </Formik>
  );
}
