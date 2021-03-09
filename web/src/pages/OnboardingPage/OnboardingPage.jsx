import React, {useEffect, useState, useContext, useRef} from 'react';
import {useHistory, useLocation, useParams} from 'react-router-dom';
import {AuthContext} from '../../App';
import {db} from '../../firebase';
import {getPaginatedGroupReferencesFromCollectionRef} from '../../helpers/groups';
import TopicListItem from '../../components/Topics/TopicListItem';
import FollowTopicButton from '../../components/Topics/FollowTopicButton';
import FollowGroupButton from '../../components/Group/FollowGroupButton';
import GroupListItem from '../../components/Group/GroupListItem';
import FollowUserButton from '../../components/User/FollowUserButton/FollowUserButton';
import SecondaryButton from '../../components/Buttons/SecondaryButton';
import {CreateGroupIcon} from '../../assets/MenuIcons';
import CreateGroupPage from '../../components/Group/CreateGroupPage/CreateGroupPage';
import UserListItem from '../../components/User/UserListItem';
import FormDatabaseSearch from '../../components/Forms/FormDatabaseSearch';
import SuccessMessage from '../../components/Forms/SuccessMessage';
import LinkAuthorIDForm from '../../components/Publication/ConnectToPublications/ConnectToPublications';
import {PaddedPageContainer} from '../../components/Layout/Content';
import SearchMSFields from '../../components/Topics/SearchMSFields';

import './OnboardingPage.css';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

const FOLLOW = 'follow';
const LINKAUTHOR = 'link-author';
const GROUPS = 'groups';

export default function OnboardingPage() {
  const history = useHistory();
  const {user} = useContext(AuthContext);
  const location = useLocation();
  const onboardingStage = useParams().onboardingStage;
  const locationState = location.state;
  const returnLocation = locationState
    ? locationState.returnLocation
    : undefined;
  if (user === undefined) history.push('/');
  const OnboardingStageDisplay = () => {
    switch (onboardingStage) {
      case FOLLOW:
        return <OnboardingFollow user={user} />;
      case LINKAUTHOR:
        return (
          <OnboardingAuthorLink nextOnboardingStage={nextOnboardingStage} />
        );
      case GROUPS:
        return <OnboardingGroup user={user} />;
      default:
        return <OnboardingFollow user={user} />;
    }
  };

  const nextOnboardingStage = () => {
    switch (onboardingStage) {
      case FOLLOW:
        history.push(`/onboarding/${LINKAUTHOR}`);
        break;
      case LINKAUTHOR:
        history.push(`/onboarding/${GROUPS}`);
        break;
      case GROUPS:
        history.push(returnLocation ? returnLocation : '/');
        break;
      default:
        throw new Error('invalid stage');
    }
  };

  const previousOnboardingStage = () => {
    switch (onboardingStage) {
      case LINKAUTHOR:
        history.push(`/onboarding/${FOLLOW}`);
        break;
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
        <button
          className="onboarding-skip-button"
          onClick={() => nextOnboardingStage()}
        >
          Skip
        </button>
        <div className="onboarding-next-back-container">
          {onboardingStage !== FOLLOW ? (
            <button
              className="onboarding-back-button"
              onClick={() => previousOnboardingStage()}
            >
              Back
            </button>
          ) : null}
          <SecondaryButton onClick={() => nextOnboardingStage()}>
            {onboardingStage === GROUPS ? 'Finish' : 'Next'}
          </SecondaryButton>
        </div>
      </div>
    </PaddedPageContainer>
  );
}

function OnboardingFollow({user}) {
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [displayedTopics, setDisplayedTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  return (
    <div className="onboarding-page-container">
      <div>
        <h3>
          Labspoon is all about finding and following research that interests
          you.
        </h3>
        <h4 className="onboarding-page-instructions">
          Find researchers who are active in your field of interest:
        </h4>
        <div className="onboarding-user-container">
          <FormDatabaseSearch
            setDisplayedItems={setDisplayedUsers}
            indexName="_USERS"
            placeholderText="Find researchers"
            displayedItems={displayedUsers}
            clearListOnNoResults={true}
          />
          <div>
            <div className="onboarding-users-to-follow-container">
              {displayedUsers.map((displayedUser) =>
                displayedUser.id === user.uid ? null : (
                  <UserListItem
                    user={displayedUser}
                    key={displayedUser.id}
                    LinkOverride={WarnOnClick}
                  >
                    <FollowUserButton targetUser={displayedUser} />
                  </UserListItem>
                )
              )}
            </div>
          </div>
        </div>
        <h4 className="onboarding-page-instructions">
          Or try looking for a specific topic:
        </h4>
        <div className="onboarding-topic-search-container">
          <SearchMSFields
            setFetchedTopics={setDisplayedTopics}
            placeholder="Search for topics"
            searchIcon={true}
            setLoading={setLoadingTopics}
          />
          {loadingTopics && (
            <div className="onboarding-page-topic-search-loading-container">
              <LoadingSpinner />
            </div>
          )}
        </div>
        <div className="onboarding-topics-to-follow-container">
          {displayedTopics.map((displayedTopic) => {
            return (
              <TopicListItem
                topic={displayedTopic}
                key={displayedTopic.microsoftID}
                LinkOverride={WarnOnClick}
              >
                <FollowTopicButton targetTopic={displayedTopic} />
              </TopicListItem>
            );
          })}
        </div>
      </div>
    </div>
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

function OnboardingGroup({user}) {
  const [displayedGroups, setDisplayedGroups] = useState([]);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [confirmGroupCreation, setConfirmGroupCreation] = useState(false);
  const groupSearchRef = useRef();

  useEffect(() => {
    if (confirmGroupCreation) {
      setTimeout(() => setConfirmGroupCreation(false), 5000);
    }
  }, [confirmGroupCreation]);

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
      {creatingGroup ? (
        <CreateGroupPage
          onboardingCancelOrSubmitAction={() => setCreatingGroup(false)}
          confirmGroupCreation={() => setConfirmGroupCreation(true)}
        />
      ) : (
        <>
          <h4 className="onboarding-page-instructions">
            {`Want your group to appear on Labspoon? Create it now.`}
          </h4>
          <div className="onboarding-create-group-button-container">
            {confirmGroupCreation ? (
              <SuccessMessage>
                Group Created! Find it by clicking on your profile picture in
                the top right.
              </SuccessMessage>
            ) : (
              <button onClick={() => setCreatingGroup(true)}>
                <div className="onboarding-create-group-button">
                  <CreateGroupIcon />
                  <h4>Create a Group</h4>
                </div>
              </button>
            )}
          </div>
          <p className="onboarding-hint-do-it-later">
            {`Don't worry, you can always make one later, just click on your profile picture in the top right!`}
          </p>
        </>
      )}
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
