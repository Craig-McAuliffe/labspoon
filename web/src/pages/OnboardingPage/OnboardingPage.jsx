import React, {useEffect, useState, useContext, useRef} from 'react';
import {Link, useHistory, useLocation, useParams} from 'react-router-dom';
import {AuthContext} from '../../App';
import {db} from '../../firebase';
import {getPaginatedGroupReferencesFromCollectionRef} from '../../helpers/groups';
import FollowGroupButton from '../../components/Group/FollowGroupButton';
import GroupListItem from '../../components/Group/GroupListItem';
import SecondaryButton from '../../components/Buttons/SecondaryButton';
import CreateGroupPage from '../../components/Group/CreateGroupPage/CreateGroupPage';
import FormDatabaseSearch from '../../components/Forms/FormDatabaseSearch';
import LinkAuthorIDForm from '../../components/Publication/ConnectToPublications/ConnectToPublications';
import {PaddedPageContainer} from '../../components/Layout/Content';

import './OnboardingPage.css';

const LINKAUTHOR = 'link-author';
const GROUPS = 'groups';

export default function OnboardingPage() {
  const history = useHistory();
  const {user, userProfile} = useContext(AuthContext);
  const location = useLocation();
  const onboardingStage = useParams().onboardingStage;
  const locationState = location.state;
  const returnLocation = locationState
    ? locationState.returnLocation
    : undefined;
  const claimGroupID = locationState ? locationState.claimGroupID : undefined;
  if (user === undefined) history.push('/');
  const OnboardingStageDisplay = () => {
    switch (onboardingStage) {
      case LINKAUTHOR:
        return (
          <OnboardingAuthorLink nextOnboardingStage={nextOnboardingStage} />
        );
      case GROUPS:
        return <OnboardingGroup user={user} claimGroupID={claimGroupID} />;
      default:
        return <OnboardingGroup user={user} claimGroupID={claimGroupID} />;
    }
  };

  const nextOnboardingStage = () => {
    switch (onboardingStage) {
      case LINKAUTHOR:
        history.push(`/onboarding/${GROUPS}`, locationState);
        break;
      case GROUPS:
        db.doc(`users/${userProfile.id}`)
          .update({hasCompletedOnboarding: true})
          .then(() => history.push(returnLocation ? returnLocation : '/'))
          .catch((err) => {
            console.error(err);
            history.push(returnLocation ? returnLocation : '/');
          });

        break;
      default:
        throw new Error('invalid stage');
    }
  };

  const previousOnboardingStage = () => {
    switch (onboardingStage) {
      case GROUPS:
        history.push(`/onboarding/${LINKAUTHOR}`);
        break;
      default:
        throw new Error('invalid stage');
    }
  };

  return (
    <PaddedPageContainer>
      <h2 className="onboarding-main-title">Welcome to Labspoon!</h2>
      <OnboardingStageDisplay />
      <div className="onboarding-skip-next-container">
        {onboardingStage !== LINKAUTHOR ? (
          <button
            className="onboarding-back-button"
            onClick={() => previousOnboardingStage()}
          >
            Back
          </button>
        ) : (
          <div></div>
        )}
        <div className="onboarding-next-back-container">
          <SecondaryButton onClick={() => nextOnboardingStage()}>
            {onboardingStage === GROUPS ? 'Finish' : 'Next'}
          </SecondaryButton>
        </div>
      </div>
    </PaddedPageContainer>
  );
}

function WarnOnClick({children}) {
  const [warn, setWarn] = useState(false);
  const popoverContent = (
    <p>
      Other users find it useful to finish onboarding before exploring. Keep
      going!
    </p>
  );
  return (
    <Popover
      open={warn}
      setClosed={() => setWarn(false)}
      content={popoverContent}
    >
      <span className="warn-on-click" onClick={() => setWarn(true)}>
        {children}
      </span>
    </Popover>
  );
}

function Popover({children, open, setClosed, content}) {
  const popoverRef = useRef();

  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (popoverRef.current) {
        if (!popoverRef.current.contains(e.target) && open === true)
          setClosed();
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
  });

  let popover;
  if (open)
    popover = (
      <div ref={popoverRef} className="sign-up-prompt">
        {content}
      </div>
    );

  return (
    <div style={{position: 'relative'}}>
      {children}
      {popover}
    </div>
  );
}

function OnboardingGroup({user, claimGroupID}) {
  const [displayedGroups, setDisplayedGroups] = useState([]);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [createdGroupID, setCreatedGroupID] = useState(false);
  const groupSearchRef = useRef();

  const getGroups = () => {
    const groupsCollection = db.collection(`groups`);
    return getPaginatedGroupReferencesFromCollectionRef(groupsCollection, 10);
  };

  useEffect(() => {
    getGroups().then((res) => setDisplayedGroups(res));
  }, [user]);

  // This checks whether the search input has any values and re-populates list if not.
  useEffect(() => {
    if (
      groupSearchRef.current.lastChild.firstChild.firstChild.value.length < 1 &&
      displayedGroups.length === 0
    )
      getGroups().then((res) => setDisplayedGroups(res));
  }, [displayedGroups]);

  let createOrClaimGroup = creatingGroup ? (
    <CreateGroupPage
      onboardingCancelOrSubmitAction={() => setCreatingGroup(false)}
      setCreatedGroupID={setCreatedGroupID}
    />
  ) : (
    <>
      <h4 className="onboarding-page-instructions">
        {`Want your group to appear on Labspoon? Create it now.`}
      </h4>
      <div className="onboarding-create-group-button-container">
        <SecondaryButton onClick={() => setCreatingGroup(true)}>
          Create a group
        </SecondaryButton>
      </div>
      <p className="onboarding-hint-do-it-later">
        {`Don't worry, you can always make one later, just click on your profile picture in the top right!`}
      </p>
    </>
  );
  if (claimGroupID)
    createOrClaimGroup = (
      <div className="go-to-claimed-group-section">
        <h2>
          <Link to={`/group/${claimGroupID}`}>Go to claimed group</Link>
        </h2>
      </div>
    );
  if (createdGroupID)
    createOrClaimGroup = (
      <div className="go-to-claimed-group-section">
        <h2>
          <Link to={`/group/${createdGroupID}`}>Go to created group</Link>
        </h2>
      </div>
    );
  return (
    <div className="onboarding-page-container">
      <h3>Group pages are a great place to share updates from the lab.</h3>
      <h4 className="onboarding-page-instructions">{`Follow groups on Labspoon.`}</h4>
      <div>
        <FormDatabaseSearch
          setDisplayedItems={setDisplayedGroups}
          inputRef={groupSearchRef}
          indexName="_GROUPS"
          placeholderText="Find groups"
          displayedItems={displayedGroups}
        />
        <div className="onboarding-groups-to-follow-container">
          {displayedGroups.map((displayedGroup) => (
            <GroupListItem
              group={displayedGroup}
              key={displayedGroup.id}
              LinkOverride={WarnOnClick}
            >
              <FollowGroupButton targetGroup={displayedGroup} />
            </GroupListItem>
          ))}
        </div>
      </div>
      {createOrClaimGroup}
    </div>
  );
}

function OnboardingAuthorLink({nextOnboardingStage}) {
  const [linkingAuthor, setLinkingAuthor] = useState(false);
  const history = useHistory();
  return (
    <div>
      {!linkingAuthor ? (
        <>
          <h3>Have you authored any journal publications?</h3>
          <div className="onboarding-author-papers-choice-container">
            <div className="onboarding-author-papers-choice-button-container">
              <SecondaryButton
                onClick={() => setLinkingAuthor(true)}
                width="100px"
                height="60px"
              >
                Yes
              </SecondaryButton>
            </div>
            <div className="onboarding-author-papers-choice-button-container">
              <SecondaryButton
                onClick={() => nextOnboardingStage()}
                width="100px"
                height="60px"
              >
                No
              </SecondaryButton>
            </div>
          </div>
        </>
      ) : (
        <LinkAuthorIDForm
          submitBehaviour={() => history.push(`/onboarding/${GROUPS}`)}
        />
      )}
    </div>
  );
}
