import React, {useEffect, useState, useContext, useRef} from 'react';
import {useHistory, Link} from 'react-router-dom';
import {AuthContext} from '../../App';
import {db} from '../../firebase';
import {getPaginatedUserReferencesFromCollectionRef} from '../../helpers/users';
import {getPaginatedTopicsFromCollectionRef} from '../../helpers/topics';
import {getPaginatedGroupReferencesFromCollectionRef} from '../../helpers/groups';
import TopicListItem from '../../components/Topics/TopicListItem';
import GroupListItem from '../../components/Group/GroupListItem';
import FollowUserButton from '../../components/User/FollowUserButton/FollowUserButton';
import {CreateGroupIcon} from '../../assets/MenuIcons';
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
  const [onboardingStage, setOnboardingStage] = useState(0);
  const OnboardingStageDisplay = () => {
    switch (onboardingStage) {
      case 0:
        return (
          <OnboardingFollow
            setOnboardingStage={setOnboardingStage}
            user={user}
          />
        );
      case 1:
        return (
          <OnboardingGroup
            setOnboardingStage={setOnboardingStage}
            user={user}
          />
        );
      case 2:
        return null;
      default:
        return null;
    }
  };
  return (
    <div className="content-layout">
      <div className="page-content-container">
        <h2 className="onboarding-main-title">Welcome to Labspoon!</h2>
        <OnboardingStageDisplay />
      </div>
    </div>
  );
}

function OnboardingFollow({setOnboardingStage, user}) {
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

  useEffect(() => {
    console.log(userSearchRef);
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
          <OnboardingUserSearch
            setDisplayedUsers={setDisplayedUsers}
            userSearchRef={userSearchRef}
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
          <OnboardingTopicSearch
            setDisplayedTopics={setDisplayedTopics}
            topicSearchRef={topicSearchRef}
          />
          <div className="onboarding-topics-to-follow-container">
            {displayedTopics.map((displayedTopic) => (
              <TopicListItem topic={displayedTopic} key={displayedTopic.id} />
            ))}
          </div>
        </div>
      </div>
      <div className="onboarding-skip-next-container">
        <button
          className="onboarding-skip-button"
          onClick={() =>
            setOnboardingStage((onboardingStage) => onboardingStage + 1)
          }
        >
          Skip
        </button>
        <button
          className="onboarding-next-button"
          onClick={() =>
            setOnboardingStage((onboardingStage) => onboardingStage + 1)
          }
        >
          <h3> Next</h3>
        </button>
      </div>
    </div>
  );
}

function OnboardingUserSearch({setDisplayedUsers, userSearchRef}) {
  const UsersResults = ({searchResults}) => {
    if (
      searchResults &&
      searchResults.nbHits !== 0 &&
      searchResults.query.length > 0
    )
      setDisplayedUsers(searchResults.hits);
    return null;
  };

  const CustomStateUsers = connectStateResults(UsersResults);
  return (
    <div className="onboarding-search-container" ref={userSearchRef}>
      <SearchIconGrey />
      <InstantSearch
        searchClient={searchClient}
        indexName={abbrEnv + '_USERS'}
        onSearchStateChange={() => setDisplayedUsers([])}
      >
        <SearchBox
          translations={{
            placeholder: 'Find researchers',
          }}
        />

        <CustomStateUsers />
        <Configure hitsPerPage={10} />
      </InstantSearch>
    </div>
  );
}

function OnboardingTopicSearch({setDisplayedTopics, topicSearchRef}) {
  const TopicsResults = ({searchResults}) => {
    if (
      searchResults &&
      searchResults.nbHits !== 0 &&
      searchResults.query.length > 0
    )
      setDisplayedTopics(searchResults.hits);

    return null;
  };

  const CustomStateTopics = connectStateResults(TopicsResults);
  return (
    <div className="onboarding-search-container" ref={topicSearchRef}>
      <SearchIconGrey />
      <InstantSearch
        searchClient={searchClient}
        indexName={abbrEnv + '_TOPICS'}
        onSearchStateChange={() => setDisplayedTopics([])}
      >
        <SearchBox
          translations={{
            placeholder: 'Find topics',
          }}
        />
        <CustomStateTopics />
        <Configure hitsPerPage={10} />
      </InstantSearch>
    </div>
  );
}

function OnboardingGroup({setOnboardingStage, user}) {
  const [displayedGroups, setDisplayedGroups] = useState([]);
  const history = useHistory();
  const groupSearchRef = useRef();

  const getGroups = () => {
    const groupsCollection = db.collection(`groups`);
    return getPaginatedGroupReferencesFromCollectionRef(groupsCollection, 10);
  };

  useEffect(() => {
    getGroups().then((res) => setDisplayedGroups(res));
  }, [user]);

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
      <span className="onboarding-hint-non-researchers">
        {' '}
        (You can follow groups regardless!)
      </span>
      <div onboarding-group-search>
        <OnboardingGroupSearch
          setDisplayedGroups={setDisplayedGroups}
          groupSearchRef={groupSearchRef}
        />

        <div className="onboarding-groups-to-follow-container">
          {displayedGroups.map((displayedGroup) => (
            <GroupListItem group={displayedGroup} key={displayedGroup.id} />
          ))}
        </div>
      </div>
      <h4 className="onboarding-page-instructions">
        Is your group not on Labspoon? Create one now.
      </h4>
      <div className="onboarding-create-group-button-container">
        <Link href="/group/create">
          <div className="onboarding-create-group-button">
            <CreateGroupIcon />
            <h4>Create a Group</h4>
          </div>
        </Link>
      </div>
      <div className="onboarding-skip-next-container">
        <button
          className="onboarding-skip-button"
          onClick={() => history.push('/')}
        >
          Skip
        </button>
        <div>
          <button
            className="onboarding-back-button"
            onClick={() =>
              setOnboardingStage((onboardingStage) => onboardingStage - 1)
            }
          >
            Back
          </button>
          <button
            className="onboarding-next-button"
            onClick={() => history.push('/')}
          >
            <h3> Next</h3>
          </button>
        </div>
      </div>
    </div>
  );
}

function OnboardingGroupSearch({setDisplayedGroups, groupSearchRef}) {
  const UsersResults = ({searchResults}) => {
    if (
      searchResults &&
      searchResults.nbHits !== 0 &&
      searchResults.query.length > 0
    )
      setDisplayedGroups(searchResults.hits);
    return null;
  };

  const CustomStateUsers = connectStateResults(UsersResults);
  return (
    <div className="onboarding-search-container" ref={groupSearchRef}>
      <SearchIconGrey />
      <InstantSearch
        searchClient={searchClient}
        indexName={abbrEnv + '_GROUPS'}
        onSearchStateChange={() => setDisplayedGroups([])}
      >
        <SearchBox
          translations={{
            placeholder: 'Find your group',
          }}
        />
        <CustomStateUsers />
        <Configure hitsPerPage={10} />
      </InstantSearch>
    </div>
  );
}
