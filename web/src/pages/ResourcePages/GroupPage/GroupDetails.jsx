import React, {useEffect, useState, useContext} from 'react';
import {Link, useHistory} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheckCircle} from '@fortawesome/free-solid-svg-icons';
import withSizes from 'react-sizes';
import {FeatureFlags, AuthContext} from '../../../App';
import {db} from '../../../firebase';
import {userToUserRef} from '../../../helpers/users';
import GroupAvatar from '../../../components/Avatar/GroupAvatar';
import FollowGroupButton from '../../../components/Group/FollowGroupButton';
import MessageButton from '../../../components/Buttons/MessageButton';
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

const mapGroupDetailsSizesToProps = ({width}) => ({
  // When the whole site has similar content, we will only switch to this view at 800
  // isMobile: width && width <= 800,
  isMobile: width && width <= 400,
});

const GROUP_DESCRIPTION_HEIGHT = 144;

const GroupDetails = ({
  group,
  userIsMember,
  verified,
  groupID,
  routedTabID,
  isMobile,
}) => {
  const featureFlags = useContext(FeatureFlags);
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

  const groupCoverDisplay = (
    <div className="group-cover-photo-container">
      <UserCoverPhoto
        src={group.coverPhoto}
        alt={`group cover picture`}
        isGroup={true}
      />
    </div>
  );
  const groupWebsiteAndFollowOrEditDisplay = (
    <div className="group-website-follow-container">
      <WebsiteLink link={group.website} />
      {userIsMember ? (
        <Link to={routedTabID ? `edit/info` : `${groupID}/edit/info`}>
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
          {featureFlags.has('group-message-button') ? <MessageButton /> : null}
        </div>
        {isMobile && groupWebsiteAndFollowOrEditDisplay}
        <div className="group-header-info">
          <div className="group-header-name-insitution">
            <h2>{group.name}</h2>
            <h4>{group.institution}</h4>
          </div>
        </div>
      </div>

      {!isMobile && groupCoverDisplay}
      {!isMobile && groupWebsiteAndFollowOrEditDisplay}

      <div className="group-description">
        <SeeMore id={group.id} initialHeight={GROUP_DESCRIPTION_HEIGHT}>
          <RichTextBody body={group.about} shouldLinkify={true} />
        </SeeMore>
      </div>
      <DonationLink verified={verified} donationLink={group.donationLink} />
      {group.isGeneratedFromTwitter && (
        <ClaimGroup groupID={groupID} group={group} />
      )}
      {pinnedItem ? <PinnedItem pinnedItem={pinnedItem} /> : null}
    </>
  );
};

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

function ClaimGroup({groupID, group}) {
  const history = useHistory();
  const {userProfile} = useContext(AuthContext);
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
          <button
            type="button"
            className="donate-button"
            onClick={async () => {
              if (userProfile) {
                await claimGroupFromTwitter(
                  groupID,
                  userProfile.name,
                  userProfile.id,
                  group,
                  userToUserRef(userProfile, userProfile.id)
                );
                return window.location.reload();
              }
              history.push('/signup', {claimGroupID: groupID});
            }}
          >
            <h3>Claim Group</h3>
          </button>
        </div>
      </div>
    </>
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

// Tracks window width and sends boolean prop to
// SimilarContentSider if below 800px
export default withSizes(mapGroupDetailsSizesToProps)(GroupDetails);
