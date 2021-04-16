import React, {useContext, useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import UserAvatar from '../Avatar/UserAvatar';
import PrimaryButton from '../Buttons/PrimaryButton';
import DefaultUserIcon from '../../assets/DefaultUserIcon.svg';
import {AuthContext} from '../../App';
import {FollowsPageListItemOptions} from '../Popovers/FollowOptionsPopover';
import {USER} from '../../helpers/resourceTypeDefinitions';
import TertiaryButton from '../Buttons/TertiaryButton';
import {EditIcon} from '../../assets/GeneralActionIcons';
import HeaderAndBodyArticleInput, {
  CreateRichTextCharacterCount,
  initialValueNoTitle,
  yupRichBodyOnlyValidation,
} from '../Forms/Articles/HeaderAndBodyArticleInput';
import {Form, Formik} from 'formik';
import SuccessMessage from '../Forms/SuccessMessage';
import {db} from '../../firebase';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import CreateResourceFormActions from '../Forms/CreateResourceFormActions';
import * as Yup from 'yup';
import './UserListItem.css';

const USER_BIO_WORD_LIMIT = 1500;
export default function UserListItem({
  user,
  children,
  LinkOverride = undefined,
  noBorder,
  isFollowsPageResults,
  hasEditBioOption,
  overrideDisplayForSelf,
  memberOfGroupID,
}) {
  const {userProfile} = useContext(AuthContext);
  const [editBioExpanded, setEditBioExpanded] = useState(false);
  const [editBioSuccess, setEditBioSuccess] = useState(false);

  const userProfileID = userProfile ? userProfile.id : undefined;

  useEffect(() => {
    if (!editBioSuccess) return;
    const editBioSuccessTimeout = setTimeout(
      () => setEditBioSuccess(false),
      3000
    );
    return () => clearTimeout(editBioSuccessTimeout);
  }, [editBioSuccess]);
  if (!user.id) return null;
  function WrapWithLinkOrOverride({children}) {
    if (LinkOverride) return <LinkOverride>{children}</LinkOverride>;
    return <Link to={`/user/${user.id}`}>{children}</Link>;
  }

  const details = (
    <div
      className={`user-list-item-link-${
        user.backgroundShade ? user.backgroundShade : 'light'
      }`}
    >
      <WrapWithLinkOrOverride>
        <div className="Avatar">
          {user.avatar ? (
            <UserAvatar src={user.avatar} width="60px" height="60px" />
          ) : (
            <img
              src={DefaultUserIcon}
              alt="default user icon"
              className="user-list-item-default-avatar"
            />
          )}
        </div>
        <div className="AvatarSmall">
          {user.avatar ? (
            <UserAvatar src={user.avatar} width="40px" height="40px" />
          ) : (
            <img
              src={DefaultUserIcon}
              alt="default user icon"
              className="user-list-item-default-small"
            />
          )}
        </div>
      </WrapWithLinkOrOverride>

      <div className="user-list-item-name">
        <WrapWithLinkOrOverride>
          <h2>{user.name}</h2>
          <h4>{user.name}</h4>
        </WrapWithLinkOrOverride>
      </div>
      {editBioSuccess && (
        <SuccessMessage isOverlay={true}>Successfully saved!</SuccessMessage>
      )}
    </div>
  );

  let containerClassName = `user-list-item-container-${
    user.backgroundShade ? user.backgroundShade : 'light'
  }`;
  if (noBorder) containerClassName = containerClassName + '-no-border';
  if (isFollowsPageResults)
    containerClassName = 'user-list-item-container-follows-options';

  let midSection = <h3>{user.institution}</h3>;
  if (isFollowsPageResults)
    midSection = (
      <FollowsPageListItemOptions
        targetResourceData={user}
        resourceType={USER}
      />
    );
  if (hasEditBioOption)
    midSection = (
      <h3 className="user-list-item-edit-bio">
        <TertiaryButton
          onClick={() => setEditBioExpanded((currentState) => !currentState)}
        >
          <EditIcon />
          Edit Bio
        </TertiaryButton>
      </h3>
    );
  return (
    <>
      <div className={containerClassName}>
        {details}
        <div
          className={`user-list-item-institution-${
            user.backgroundShade ? user.backgroundShade : 'light'
          }`}
        >
          {midSection}
        </div>
        {userProfileID === user.id && !overrideDisplayForSelf ? null : (
          <div className="Follow">{children}</div>
        )}
      </div>
      {editBioExpanded && (
        <EditUserBio
          setEditBioExpanded={setEditBioExpanded}
          setEditBioSuccess={setEditBioSuccess}
          existingUserBio={user.bio}
          memberOfGroupID={memberOfGroupID}
          userID={user.id}
        />
      )}
    </>
  );
}

function EditUserBio({
  setEditBioSuccess,
  setEditBioExpanded,
  existingUserBio,
  userID,
  memberOfGroupID,
}) {
  const [userBio, setUserBio] = useState(
    existingUserBio ? {bio: existingUserBio} : {bio: initialValueNoTitle}
  );
  const [submittingUserBio, setSubmittingBio] = useState(false);
  if (submittingUserBio) return <LoadingSpinner />;
  return (
    <div className="user-list-item-edit-bio-expanded-container">
      <Formik
        initialValues={userBio}
        validationSchema={Yup.object({
          bio: yupRichBodyOnlyValidation(USER_BIO_WORD_LIMIT, 12),
        })}
        onSubmit={(res) =>
          submitUserBio(
            res,
            existingUserBio,
            setEditBioExpanded,
            setEditBioSuccess,
            setUserBio,
            userID,
            memberOfGroupID,
            setSubmittingBio
          )
        }
      >
        <Form>
          <HeaderAndBodyArticleInput
            name="bio"
            shouldAutoFocus={true}
            label="User Bio"
            minHeight={300}
          />
          <CreateRichTextCharacterCount
            name="bio"
            maxCount={USER_BIO_WORD_LIMIT}
          />
          <CreateResourceFormActions
            noBorder={true}
            submitting={submittingUserBio}
            submitText="Save"
            cancelForm={() => setEditBioExpanded(false)}
          />
        </Form>
      </Formik>
    </div>
  );
}
async function submitUserBio(
  res,
  existingBio,
  setEditBioExpanded,
  setEditBioSuccess,
  setUserBio,
  userID,
  memberOfGroupID,
  setSubmittingBio
) {
  setSubmittingBio(true);
  if (JSON.stringify(res.bio) === JSON.stringify(existingBio)) {
    setSubmittingBio(false);
    setEditBioExpanded(false);
    return;
  }
  return db
    .doc(`groups/${memberOfGroupID}/members/${userID}`)
    .update({
      bio: res.bio,
    })
    .then(() => {
      setEditBioSuccess(true);
      setSubmittingBio(false);
      setEditBioExpanded(false);
      return;
    })
    .catch((err) => {
      console.error(
        `unable to update bio for group member ${userID} on group ${memberOfGroupID} ${err}`
      );
      alert('Something went wrong. Please try again');
      setUserBio(res.bio);
      setSubmittingBio(false);
      return;
    });
}

export function UserListItemEmailOnly({user, children}) {
  return (
    <div className="user-list-item-container">
      <div className="user-list-item-link">
        <AvatarSection />
        <div className="user-list-item-email">
          <h2>{user.email}</h2>
        </div>
      </div>
      <div className="Follow">{children}</div>
    </div>
  );
}

function AvatarSection({avatar}) {
  return (
    <>
      <div className="Avatar">
        {avatar ? (
          <UserAvatar src={avatar} width="60px" height="60px" />
        ) : (
          <img
            src={DefaultUserIcon}
            alt="default user icon"
            className="user-list-item-default-avatar"
          />
        )}
      </div>
      <div className="AvatarSmall">
        {avatar ? (
          <UserAvatar src={avatar} width="40px" height="40px" />
        ) : (
          <img
            src={DefaultUserIcon}
            alt="default user icon"
            className="user-list-item-default-small"
          />
        )}
      </div>
    </>
  );
}

export function UserSmallResultItem({user, selectUser}) {
  const select = () => selectUser(user);
  return (
    <div
      className={`user-list-item-container-${
        user.backgroundShade ? user.backgroundShade : 'light'
      }`}
    >
      <div
        className={`user-list-item-link-${
          user.backgroundShade ? user.backgroundShade : 'light'
        }`}
      >
        {user.avatar ? (
          <UserAvatar src={user.avatar} width="40px" height="40px" />
        ) : (
          <img
            src={DefaultUserIcon}
            alt="default user icon"
            className="user-list-item-default-small"
          />
        )}
        <h4>{user.name}</h4>
      </div>
      <div
        className={`user-list-item-institution-${
          user.backgroundShade ? user.backgroundShade : 'light'
        }`}
      >
        <h4>{user.institution}</h4>
      </div>
      <div className="Follow">
        <PrimaryButton onClick={select} smallVersion>
          Select
        </PrimaryButton>
      </div>
    </div>
  );
}
