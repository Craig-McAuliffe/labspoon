import React, {useEffect, useState, useContext} from 'react';
import {Link, useHistory} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheckCircle} from '@fortawesome/free-solid-svg-icons';
import withSizes from 'react-sizes';
import {AuthContext} from '../../../App';
import {db} from '../../../firebase';
import {userToUserRef} from '../../../helpers/users';
import GroupAvatar from '../../../components/Avatar/GroupAvatar';
import FollowGroupButton from '../../../components/Group/FollowGroupButton';
import EditButton from '../../../components/Buttons/EditButton';
import SeeMore from '../../../components/SeeMore';
import {WebsiteIcon} from '../../../assets/PostOptionalTagsIcons';
import {GROUPS} from '../../../helpers/resourceTypeDefinitions';
import './GroupPage.css';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import {RichTextBody} from '../../../components/Article/Article';
import TertiaryButton from '../../../components/Buttons/TertiaryButton';
import UserCoverPhoto from '../../../components/User/UserCoverPhoto';
import {GenericListItem} from '../../../components/Results/Results';
import {claimGroupFromTwitter} from '../../LoginSignup/SignupPage/SignupPage';
import Popover, {
  StandardPopoverDisplay,
} from '../../../components/Popovers/Popover';
import PrimaryButton from '../../../components/Buttons/PrimaryButton';
import NegativeButton from '../../../components/Buttons/NegativeButton';
import {
  AVATAR_EMBEDDED_HEADER_DISPLAY,
  AVATAR_INTERNAL_HEADER_DISPLAY,
  DARK_NAME_SHADE,
  NO_AVATAR_CENTER_TEXT_HEADER_DISPLAY,
  NO_AVATAR_LEFT_TEXT_HEADER_DISPLAY,
} from './EditGroupDisplay';

const mapGroupDetailsSizesToProps = ({width}) => ({
  // When the whole site has similar content, we will only switch to this view at 800
  // isMobile: width && width <= 800,
  isMobile: width && width <= 400,
});

const GROUP_DESCRIPTION_HEIGHT = 144;

const GroupDetails = ({group, userIsMember, verified, groupID, isMobile}) => {
  const [isSlowLoad, setIsSlowLoad] = useState(false);
  const [pinnedItem, setPinnedItem] = useState(null);

  useEffect(() => {
    if (!groupID) return;
    const groupDocObserver = db
      .doc(`groups/${groupID}`)
      .onSnapshot((docSnapshot) => {
        const newGroupData = docSnapshot.data();
        if (!newGroupData) return;
        const fetchedPinnedItem = newGroupData.pinnedItem;
        if (!fetchedPinnedItem) {
          return setPinnedItem(null);
        }
        if (userIsMember) {
          fetchedPinnedItem.showPinOption = true;
          fetchedPinnedItem.pinProfileCollection = GROUPS;
          fetchedPinnedItem.pinProfileID = groupID;
        }
        return setPinnedItem(fetchedPinnedItem);
      });
    return () => groupDocObserver();
  }, [groupID, userIsMember]);
  useEffect(() => {
    if (group && isSlowLoad) {
      setIsSlowLoad(false);
      return;
    }
    const refreshAdviceTimer = setTimeout(() => {
      if (group) return;
      setIsSlowLoad(true);
    }, 8000);
    return () => {
      clearTimeout(refreshAdviceTimer);
    };
  }, [group, isSlowLoad]);

  if (!group)
    return (
      <div className="group-header">
        <div className="group-page-details-loading"></div>
        <div className="group-page-details-loading">
          <LoadingSpinner />
          {isSlowLoad && (
            <p>
              This is taking a while... try{' '}
              <TertiaryButton onClick={() => window.location.reload()}>
                refreshing the page
              </TertiaryButton>
            </p>
          )}
        </div>
      </div>
    );

  return (
    <>
      <GroupDetailsHeaderSection
        group={group}
        isMobile={isMobile}
        userIsMember={userIsMember}
        groupID={groupID}
      />
      <div className="group-description">
        <SeeMore id={group.id} initialHeight={GROUP_DESCRIPTION_HEIGHT}>
          <RichTextBody body={group.about} shouldLinkify={true} />
        </SeeMore>
      </div>
      <DonationLink verified={verified} donationLink={group.donationLink} />
      {group.isGeneratedFromTwitter && (
        <ClaimGroup isMobile={isMobile} groupID={groupID} group={group} />
      )}
      {pinnedItem ? <PinnedItem pinnedItem={pinnedItem} /> : null}
    </>
  );
};

export function GroupDetailsHeaderSection({
  isMobile,
  group,
  userIsMember,
  groupID,
  designOnly,
  displayType,
  nameShade,
}) {
  switch (displayType) {
    case AVATAR_EMBEDDED_HEADER_DISPLAY:
      return (
        <AvatarEmbeddedHeader
          isMobile={isMobile}
          group={group}
          userIsMember={userIsMember}
          groupID={groupID}
          designOnly={designOnly}
          displayType={displayType}
        />
      );
    case AVATAR_INTERNAL_HEADER_DISPLAY:
      return (
        <AvatarInternalHeader
          group={group}
          userIsMember={userIsMember}
          groupID={groupID}
          designOnly={designOnly}
          displayType={displayType}
          nameShade={nameShade}
        />
      );
    case NO_AVATAR_LEFT_TEXT_HEADER_DISPLAY:
      return (
        <NoAvatarLeftTextHeader
          group={group}
          userIsMember={userIsMember}
          groupID={groupID}
          designOnly={designOnly}
          displayType={displayType}
        />
      );
    case NO_AVATAR_CENTER_TEXT_HEADER_DISPLAY:
      return (
        <NoAvatarCenterTextHeader
          group={group}
          userIsMember={userIsMember}
          groupID={groupID}
          designOnly={designOnly}
          displayType={displayType}
        />
      );
    default:
      return (
        <AvatarEmbeddedHeader
          isMobile={isMobile}
          group={group}
          userIsMember={userIsMember}
          groupID={groupID}
          designOnly={designOnly}
          displayType={displayType}
        />
      );
  }
}

function AvatarEmbeddedHeader({
  isMobile,
  group,
  userIsMember,
  groupID,
  designOnly,
}) {
  const groupCoverDisplay = (
    <div className="group-cover-photo-container">
      <UserCoverPhoto
        src={group.coverPhoto}
        alt={`group cover picture`}
        isGroup={true}
      />
    </div>
  );
  const groupWebsiteAndFollowOrEditDisplay = designOnly ? (
    <div style={isMobile ? {height: '40px'} : {height: '0px'}}></div>
  ) : (
    <div className="group-website-follow-container">
      <WebsiteLink link={group.website} />
      {userIsMember ? (
        <Link to={`/group/${groupID}/edit/info`}>
          <EditButton editAction={() => {}}>Edit Group</EditButton>
        </Link>
      ) : (
        <FollowGroupButton targetGroup={group} />
      )}
    </div>
  );
  return (
    <>
      {isMobile && groupCoverDisplay}
      <div className="group-header">
        <div className="group-icon-and-message">
          <div className="group-avatar-positioning">
            <GroupAvatar src={group.avatar} height="160" width="160" />
          </div>
        </div>
        {isMobile && groupWebsiteAndFollowOrEditDisplay}
        <div className="group-header-info">
          <div className="group-header-name-institution">
            <h2>{group.name}</h2>
            <h4>{group.institution}</h4>
          </div>
        </div>
      </div>
      {!isMobile && groupCoverDisplay}
      {!isMobile && groupWebsiteAndFollowOrEditDisplay}
    </>
  );
}

function AvatarInternalHeader({
  group,
  userIsMember,
  groupID,
  designOnly,
  nameShade,
}) {
  const groupWebsiteAndFollowOrEditDisplay = designOnly ? null : (
    <div className="group-website-follow-container">
      <WebsiteLink link={group.website} />
      {userIsMember ? (
        <Link to={`/group/${groupID}/edit/info`}>
          <EditButton editAction={() => {}}>Edit Group</EditButton>
        </Link>
      ) : (
        <FollowGroupButton targetGroup={group} />
      )}
    </div>
  );

  return (
    <>
      <div className="group-details-internal-headline-section">
        <UserCoverPhoto
          src={group.coverPhoto}
          alt={`group cover picture`}
          isGroup={true}
        />

        <div className="group-details-internal-headline-avatar-text-container">
          <div className="group-details-internal-headline-avatar-container">
            <GroupAvatar src={group.avatar} />
          </div>
          <div
            className={`group-details-internal-name-institution${
              nameShade === DARK_NAME_SHADE ? '-dark' : '-light'
            }`}
          >
            <h2>{group.name}</h2>
            <h4>{group.institution}</h4>
          </div>
        </div>
      </div>
      {groupWebsiteAndFollowOrEditDisplay}
    </>
  );
}

function NoAvatarLeftTextHeader({group, userIsMember, groupID, designOnly}) {
  return (
    <>
      <div className="group-details-no-avatar-name-institution-container">
        <h2>{group.name}</h2>
        <h4>{group.institution}</h4>
      </div>
      <div className="group-cover-photo-container">
        <UserCoverPhoto
          src={group.coverPhoto}
          alt={`group cover picture`}
          isGroup={true}
        />
        {designOnly ? null : (
          <div className="group-website-follow-container">
            <WebsiteLink link={group.website} />
            {userIsMember ? (
              <Link to={`/group/${groupID}/edit/info`}>
                <EditButton editAction={() => {}}>Edit Group</EditButton>
              </Link>
            ) : (
              <FollowGroupButton targetGroup={group} />
            )}
          </div>
        )}
      </div>
    </>
  );
}

function NoAvatarCenterTextHeader({group, userIsMember, groupID, designOnly}) {
  return (
    <>
      <div className="group-details-no-avatar-center-name">
        <h2>{group.name.toUpperCase()}</h2>
        <h4 className="group-details-no-avatar-institution">
          {group.institution}
        </h4>
      </div>
      <div className="group-cover-photo-container">
        <UserCoverPhoto
          src={group.coverPhoto}
          alt={`group cover picture`}
          isGroup={true}
        />
        {designOnly ? null : (
          <div className="group-website-follow-container">
            <WebsiteLink link={group.website} />
            {userIsMember ? (
              <Link to={`/group/${groupID}/edit/info`}>
                <EditButton editAction={() => {}}>Edit Group</EditButton>
              </Link>
            ) : (
              <FollowGroupButton targetGroup={group} />
            )}
          </div>
        )}
      </div>
    </>
  );
}

function WebsiteLink({link}) {
  if (!link) return <div></div>;
  if (link.length === 0) return <div></div>;
  return (
    <a
      className="group-website-link"
      href={link}
      target="_blank"
      rel="noopener noreferrer"
    >
      <WebsiteIcon /> <span>Website</span>
    </a>
  );
}

function DonationLink({verified, donationLink}) {
  if (!verified || !donationLink) return <></>;

  return (
    <div className="donation-link-container">
      <div className="donation-link-verified-container">
        <h4 className="registered-charity-text">
          Registered Charity{' '}
          <sup>
            <FontAwesomeIcon icon={faCheckCircle} />
          </sup>
        </h4>
        <p className="group-verification-confirmation-explanation">
          This charity page has been verified and can be trusted.
        </p>
      </div>
      <div className="donation-link-donate-container">
        <a target="_blank" href={donationLink} rel="noopener noreferrer">
          <DonateButton />
        </a>
        <p>This will take you to an external site.</p>
      </div>
    </div>
  );
}

function ClaimGroup({groupID, group, isMobile}) {
  const getPopUpComponent = (setOpen) => (
    <StandardPopoverDisplay
      right={isMobile ? '-50px' : '0px'}
      top="-5px"
      width="200px"
      content={
        <ConfirmCancelPopOverContent
          group={group}
          groupID={groupID}
          setOpen={setOpen}
        />
      }
    />
  );
  return (
    <>
      <div className="generated-group-container">
        <div>
          <h4 className="generated-group-title">
            This is an auto generated group page
          </h4>
          <p className="generated-group-explanation">
            If this is your group, you can claim it by clicking this button. If
            you&#39;d like us to remove this group, just drop us a message
            through the <Link to="/contact"> contact page.</Link>
          </p>
        </div>
        <div className="claim-group-button-container">
          <Popover getPopUpComponent={getPopUpComponent}>
            <ClaimGeneratedGroupButtonIntermediate
              actionAndTriggerPopUp={() => {}}
              groupID={groupID}
              group={group}
            />
          </Popover>
        </div>
      </div>
    </>
  );
}

function ConfirmCancelPopOverContent({group, groupID, setOpen}) {
  const {userProfile} = useContext(AuthContext);
  const [submitting, setSubmitting] = useState(false);
  if (submitting) return <LoadingSpinner />;
  const executeClaimGroup = async () => {
    setSubmitting(true);
    await claimGroupFromTwitter(
      groupID,
      userProfile.name,
      userProfile.id,
      group,
      userToUserRef(userProfile, userProfile.id)
    );
    setOpen(false);
    setSubmitting(false);
    return window.location.reload();
  };
  return (
    <div>
      <p>You are confirming that this is your research group.</p>
      <div className="group-details-claim-group-confirm-button-container">
        <PrimaryButton onClick={executeClaimGroup}>Confirm</PrimaryButton>
      </div>
      <div className="group-details-claim-group-confirm-button-container">
        <NegativeButton onClick={() => setOpen(false)}>Cancel</NegativeButton>
      </div>
    </div>
  );
}

function ClaimGeneratedGroupButtonIntermediate({
  actionAndTriggerPopUp,
  groupID,
}) {
  const history = useHistory();
  const {userProfile} = useContext(AuthContext);
  return (
    <button
      type="button"
      className="donate-button"
      onClick={async () => {
        if (userProfile) {
          return actionAndTriggerPopUp();
        }
        history.push('/signup', {claimGroupID: groupID});
      }}
    >
      <h3>Claim Group</h3>
    </button>
  );
}
function DonateButton() {
  return (
    <button type="button" className="donate-button">
      <h3>Donate</h3>
    </button>
  );
}

function PinnedItem({pinnedItem}) {
  return (
    <div className="pinned-item-container">
      <GenericListItem result={pinnedItem} />
    </div>
  );
}

// Tracks window width and sends boolean prop
export default withSizes(mapGroupDetailsSizesToProps)(GroupDetails);
