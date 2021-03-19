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
import LoadingSpinner, {
  LoadingSpinnerPage,
} from '../LoadingSpinner/LoadingSpinner';
import {getUserGroups} from '../../helpers/users';
import HeaderAndBodyArticleInput, {
  initialValueNoTitle,
  yupRichBodyOnlyValidation,
} from '../Forms/Articles/HeaderAndBodyArticleInput';
import TagTopics from '../Topics/TagTopics';
import CreateResourceFormActions from '../Forms/CreateResourceFormActions';
import FormImageUpload from '../Images/FormImageUpload';
import addArticleToDB from '../../helpers/articles';
import {RESEARCHFOCUSES} from '../../helpers/resourceTypeDefinitions';
import {uploadImagesAndGetURLs} from '../../helpers/images';

import './CreateResearchFocus.css';
import FormTextInput from '../Forms/FormTextInput';
import {
  AboutArticles,
  articleTitleValidation,
  CreateArticleCharacterCount,
  MAX_ARTICLE_CHARACTERS,
} from '../Article/Article';

export default function CreateResearchFocus() {
  const preSelectedGroupID = useParams().groupID;
  const [selectedGroup, setSelectedGroup] = useState(undefined);
  const [memberOfGroups, setMemberOfGroups] = useState([]);
  const [loadingMemberOfGroups, setLoadingMemberOfGroups] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [savedInitialValues, setSavedInitialValues] = useState({
    title: '',
    body: initialValueNoTitle,
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
    const researchFocusOnGroupRef = db.doc(
      `groups/${selectedGroup.id}/researchFocuses/${researchFocusID}`
    );
    const failFunction = () =>
      setSavedInitialValues({
        researchFocus: res.researchFocus,
        photos: res.photos,
      });
    if (res.photos.length === 0) {
      return addArticleToDB(
        res.title,
        res.body,
        [],
        selectedTopics,
        selectedGroup,
        userProfile,
        researchFocusDBRef,
        researchFocusOnGroupRef,
        setSubmitting,
        history,
        RESEARCHFOCUSES,
        'researchFocusesCount',
        failFunction
      );
    }
    uploadImagesAndGetURLs(
      Array.from(res.photos),
      `groups/${selectedGroup.id}/researchFocuses/${researchFocusID}`
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
      return addArticleToDB(
        res.title,
        res.body,
        resizedPhotoURLs,
        selectedTopics,
        selectedGroup,
        userProfile,
        researchFocusDBRef,
        researchFocusOnGroupRef,
        setSubmitting,
        history,
        RESEARCHFOCUSES,
        'researchFocusesCount',
        failFunction
      );
    });
  }
  return (
    <Formik
      initialValues={savedInitialValues}
      validationSchema={Yup.object({
        body: yupRichBodyOnlyValidation(MAX_ARTICLE_CHARACTERS, 40),
        title: articleTitleValidation,
      })}
      onSubmit={onSubmit}
    >
      <Form>
        <SelectedGroup
          groups={memberOfGroups}
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
        />
        <AboutArticles articleType="research focus" />
        <FormTextInput name="title" label="Title" />
        <HeaderAndBodyArticleInput
          name="body"
          shouldAutoFocus={true}
          customPlaceholderText="...describe a research focus of your group"
          noTitle={true}
          label="Body"
          minHeight={300}
        />
        <CreateArticleCharacterCount name="body" />
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
