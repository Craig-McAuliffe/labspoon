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
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import {getUserGroups} from '../../helpers/users';
import HeaderAndBodyArticleInput, {
  initialValue,
  yupArticleValidation,
} from '../Forms/Articles/HeaderAndBodyArticleInput';
import TagTopics from '../Topics/TagTopics';
import CreateResourceFormActions from '../Forms/CreateResourceFormActions';
import {db} from '../../firebase';
import {uploadImagesAndGetURLs} from '../../helpers/images';
import FormImageUpload from '../Images/FormImageUpload';
import addArticleToDB from '../../helpers/articles';

export default function CreateTechnique() {
  const preSelectedGroupID = useParams().groupID;
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

    if (res.photos.length === 0) {
      addArticleToDB(
        res.technique,
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
      addArticleToDB(
        res.technique,
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
        <FormImageUpload name="photos" multiple={true} maxImages={9} />
        <CreateResourceFormActions
          submitting={submitting}
          submitText="Create"
        />
      </Form>
    </Formik>
  );
}
