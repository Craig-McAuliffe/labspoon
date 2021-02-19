import React, {useState, useEffect, useContext} from 'react';
import {useHistory, useParams} from 'react-router-dom';
import {db} from '../../firebase';
import {Formik, Form} from 'formik';
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
import {uploadImagesAndGetURLs} from '../../helpers/images';
import FormImageUpload from '../Images/FormImageUpload';
import addArticleToDB from '../../helpers/articles';
import {RESEARCHFOCUSES} from '../../helpers/resourceTypeDefinitions';

import './CreateResearchFocus.css';

export default function CreateResearchFocus() {
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

  if (submitting) return <LoadingSpinner />;

  if (selectedGroup === undefined)
    return (
      <>
        <SelectGroupLabel fieldName="Research Group">
          <SelectGroup
            groups={memberOfGroups}
            setSelectedGroup={setSelectedGroup}
            toggleText="Select from your groups"
            loading={loadingMemberOfGroups}
          />
        </SelectGroupLabel>
        <MustSelectGroup
          userHasGroups={memberOfGroups.length > 0}
          explanation="Research focus articles can only be created for groups."
        />
      </>
    );

  function onSubmit(res) {
    setSubmitting(true);
    const researchFocusDBRef = db.collection(`researchFocuses`).doc();
    const researchFocusID = researchFocusDBRef.id;

    if (res.photos.length === 0) {
      addArticleToDB(
        res.researchFocus,
        selectedTopics,
        selectedGroup,
        userProfile,
        researchFocusDBRef,
        setSubmitting,
        history,
        RESEARCHFOCUSES,
        'researchFocusesCount'
      );
      return;
    }
    uploadImagesAndGetURLs(
      Array.from(res.photos),
      `groups/${selectedGroup.id}/researchFocuses/${researchFocusID}`
    ).then(() =>
      addArticleToDB(
        res.researchFocus,
        selectedTopics,
        selectedGroup,
        userProfile,
        researchFocusDBRef,
        setSubmitting,
        history,
        RESEARCHFOCUSES,
        'researchFocusesCount'
      )
    );
  }
  return (
    <Formik
      initialValues={{
        researchFocus: initialValue,
        photos: [],
      }}
      validationSchema={Yup.object({
        researchFocus: yupArticleValidation,
      })}
      onSubmit={onSubmit}
    >
      <Form>
        <SelectedGroup
          groups={memberOfGroups}
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
        />
        <HeaderAndBodyArticleInput name="researchFocus" />
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
