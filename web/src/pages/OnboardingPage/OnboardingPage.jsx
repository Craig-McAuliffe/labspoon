import React, {useEffect, useState, useContext, useRef} from 'react';
import {useHistory} from 'react-router-dom';
import {AuthContext} from '../../App';
import {db} from '../../firebase';
import {getPaginatedUserReferencesFromCollectionRef} from '../../helpers/users';
import {getPaginatedTopicsFromCollectionRef} from '../../helpers/topics';
import {getPaginatedGroupReferencesFromCollectionRef} from '../../helpers/groups';
import TopicListItem from '../../components/Topics/TopicListItem';
import GroupListItem from '../../components/Group/GroupListItem';
import FollowUserButton from '../../components/User/FollowUserButton/FollowUserButton';
import {CreateGroupIcon} from '../../assets/MenuIcons';
import CreateGroupPage from '../Groups/CreateGroupPage/CreateGroupPage';
import UserListItem from '../../components/User/UserListItem';
import {SearchIconGrey} from '../../assets/HeaderIcons';
import {
  InstantSearch,
  SearchBox,
  Configure,
  connectStateResults,
} from 'react-instantsearch-dom';
import {searchClient} from '../../algolia';
import './OnboardingPage.css';

const abbrEnv = 'dev';

export default function OnboardingPage() {
  const {user} = useContext(AuthContext);
  const history = useHistory();
  if (user === undefined) history.push('/');
  const [onboardingStage, setOnboardingStage] = useState('follow-things');
  const OnboardingStageDisplay = () => {
    switch (onboardingStage) {
      case 'follow-things':
        return (
          <OnboardingFollow
            setOnboardingStage={setOnboardingStage}
            user={user}
          />
        );
      case 'join-groups':
        return (
          <OnboardingGroup
            setOnboardingStage={setOnboardingStage}
            user={user}
          />
        );
      default:
        return null;
    }
  };
  return (
    <div className="content-layout">
      <div className="page-content-container">
        <h2 className="onboarding-main-title">Welcome to Labspoon!</h2>
        <OnboardingStageDisplay />
        <div className="onboarding-skip-next-container">
          <button
            className="onboarding-skip-button"
            onClick={() =>
              onboardingStage === 'follow-things'
                ? setOnboardingStage('join-groups')
                : history.push('/')
            }
          >
            Skip
          </button>
          <div>
            {onboardingStage === 'join-groups' ? (
              <button
                className="onboarding-back-button"
                onClick={() => setOnboardingStage('follow-things')}
              >
                Back
              </button>
            ) : null}
            <button
              className="onboarding-next-button"
              onClick={() =>
                onboardingStage === 'follow-things'
                  ? setOnboardingStage('join-groups')
                  : history.push('/')
              }
            >
              <h3>{onboardingStage === 'join-groups' ? 'Finish' : 'Next'}</h3>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OnboardingFollow({user}) {
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [displayedTopics, setDisplayedTopics] = useState([]);
  const userSearchRef = useRef();
  const topicSearchRef = useRef();

  // Initial Suggested Users without search
  const getUsers = () => {
    const usersCollection = db.collection(`users`);
    return getPaginatedUserReferencesFromCollectionRef(usersCollection, 10);
  };

  const getTopics = () => {
    const topicsCollection = db.collection(`topics`);
    return getPaginatedTopicsFromCollectionRef(topicsCollection, 10);
  };

  useEffect(() => {
    getUsers().then((res) => setDisplayedUsers(res));
    getTopics().then((res) => setDisplayedTopics(res));
  }, [user]);

  // This checks whether the search input has any values and re-populates list if not.
  useEffect(() => {
    if (
      userSearchRef.current.lastChild.firstChild.firstChild.value.length < 1 &&
      displayedUsers.length === 0
    )
      getUsers().then((res) => setDisplayedUsers(res));
    if (
      topicSearchRef.current.lastChild.firstChild.firstChild.value.length < 1 &&
      displayedTopics.length === 0
    )
      getTopics().then((res) => setDisplayedTopics(res));
  }, [displayedUsers, displayedTopics]);

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
          <OnboardingSearch
            setDisplayedItems={setDisplayedUsers}
            inputRef={userSearchRef}
            indexName="_USERS"
            placeholderText="Find researchers"
          />
          <div>
            <div className="onboarding-users-to-follow-container">
              {displayedUsers.map((displayedUser) =>
                displayedUser.id === user.uid ? null : (
                  <UserListItem user={displayedUser} key={displayedUser.id}>
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
          <OnboardingSearch
            setDisplayedItems={setDisplayedTopics}
            inputRef={topicSearchRef}
            indexName="_TOPICS"
            placeholderText="Find topics"
          />
          <div className="onboarding-topics-to-follow-container">
            {displayedTopics.map((displayedTopic) => (
              <TopicListItem topic={displayedTopic} key={displayedTopic.id} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OnboardingSearch({
  setDisplayedItems,
  inputRef,
  indexName,
  placeholderText,
}) {
  const UsersResults = ({searchResults}) => {
    if (
      searchResults &&
      searchResults.nbHits !== 0 &&
      searchResults.query.length > 0
    )
      setDisplayedItems(searchResults.hits);
    return null;
  };

  const CustomStateUsers = connectStateResults(UsersResults);
  return (
    <div className="onboarding-search-container" ref={inputRef}>
      <SearchIconGrey />
      <InstantSearch
        searchClient={searchClient}
        indexName={abbrEnv + indexName}
        onSearchStateChange={() => setDisplayedItems([])}
      >
        <SearchBox
          translations={{
            placeholder: placeholderText,
          }}
        />

        <CustomStateUsers />
        <Configure hitsPerPage={10} />
      </InstantSearch>
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
      <h4 className="onboarding-page-instructions">{`Are you part of a research group? Find it on Labspoon and request to join.`}</h4>
      <div onboarding-group-search>
        <OnboardingSearch
          setDisplayedItems={setDisplayedGroups}
          inputRef={groupSearchRef}
          indexName="_GROUPS"
          placeholderText="Find your group"
        />
        <div className="onboarding-groups-to-follow-container">
          {displayedGroups.map((displayedGroup) => (
            <GroupListItem group={displayedGroup} key={displayedGroup.id} />
          ))}
        </div>
      </div>
      {creatingGroup ? (
        <div className="onboarding-create-group-container">
          <CreateGroupPage
            onboardingCancelOrSubmitAction={() => setCreatingGroup(false)}
            confirmGroupCreation={() => setConfirmGroupCreation(true)}
          />
        </div>
      ) : (
        <>
          <h4 className="onboarding-page-instructions">
            Is your group not on Labspoon? You can create one now.
          </h4>
          <div className="onboarding-create-group-button-container">
            <button onClick={() => setCreatingGroup(true)}>
              <div className="onboarding-create-group-button">
                <CreateGroupIcon />
                <h4>Create a Group</h4>
              </div>
            </button>
          </div>
          <p className="onboarding-hint-do-it-later">
            {`Don't worry, you can always make one later, just click on your profile picture in the top right!`}
          </p>

          {confirmGroupCreation ? (
            <div className="onboarding-success-overlay-container">
              <div className="success-overlay">
                <h3>Group Created! You can find it in the top right menu.</h3>
              </div>{' '}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
