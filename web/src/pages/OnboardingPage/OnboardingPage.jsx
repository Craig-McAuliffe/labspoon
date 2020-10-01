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
  const [onboardingStage, setOnboardingStage] = useState(0);
  const OnboardingStageDisplay = () => {
    switch (onboardingStage) {
      case 0:
        return (
          <div>
            <OnboardingFollow
              setOnboardingStage={setOnboardingStage}
              user={user}
            />
          </div>
        );
      case 1:
        return (
          <div>
            <OnboardingGroup
              setOnboardingStage={setOnboardingStage}
              user={user}
            />
          </div>
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
        <h2>Welcome to Labspoon!</h2>
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
    if (
      userSearchRef.current.firstChild.firstChild.firstChild.value.length < 1 &&
      displayedUsers.length === 0
    )
      getUsers().then((res) => setDisplayedUsers(res));
    if (
      topicSearchRef.current.firstChild.firstChild.firstChild.value.length <
        1 &&
      displayedTopics.length === 0
    )
      getTopics().then((res) => setDisplayedTopics(res));
  }, [displayedUsers, displayedTopics]);

  return (
    <>
      <div>
        <h3>
          Labspoon is all about finding and following research that interests
          you.
        </h3>
        <div className="onboarding-user-search-container">
          <h4>
            You can follow researchers who are active in your field of
            interest...
          </h4>
          <OnboardingUserSearch
            setDisplayedUsers={setDisplayedUsers}
            userSearchRef={userSearchRef}
          />
        </div>
        <div>
          <div className="onboarding-users-to-follow-container">
            {displayedUsers.map((displayedUser) => (
              <UserListItem user={displayedUser} key={displayedUser.id}>
                <FollowUserButton targetUser={displayedUser} />
              </UserListItem>
            ))}
          </div>
          <div className="onboarding-topic-search-container">
            <h4>or a specific topic.</h4>
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
      </div>
      <div className="onboarding-skip-next-container">
        <button
          onClick={() =>
            setOnboardingStage((onboardingStage) => onboardingStage + 1)
          }
        >
          Skip
        </button>
        <button
          onClick={() =>
            setOnboardingStage((onboardingStage) => onboardingStage + 1)
          }
        >
          Next
        </button>
      </div>
    </>
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
    <>
      <div className="onboarding-search" ref={userSearchRef}>
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
    </>
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
    <>
      <div className="onboarding-search" ref={topicSearchRef}>
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
    </>
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
      groupSearchRef.current.firstChild.firstChild.firstChild.value.length <
        1 &&
      displayedGroups.length === 0
    )
      getGroups().then((res) => setDisplayedGroups(res));
  }, [displayedGroups]);

  return (
    <>
      <div onboarding-group-search>
        Are you part of a research group? Find it on Labspoon...
        <OnboardingGroupSearch
          setDisplayedGroups={setDisplayedGroups}
          groupSearchRef={groupSearchRef}
        />
        <div className="onboarding-users-to-follow-container">
          {displayedGroups.map((displayedGroup) => (
            <GroupListItem group={displayedGroup} key={displayedGroup.id} />
          ))}
        </div>
      </div>
      <h3>
        or create a group page. This is a place where you can share research
        news, social occasions, and opportunities from your lab.
      </h3>
      <div>
        <Link href="/group/create">
          <CreateGroupIcon />
          <h4>Create a Group</h4>
        </Link>
      </div>
      <div className="onboarding-skip-next-container">
        <button
          onClick={() =>
            setOnboardingStage((onboardingStage) => onboardingStage + 1)
          }
        >
          Skip
        </button>
        <div>
          <button
            onClick={() =>
              setOnboardingStage((onboardingStage) => onboardingStage - 1)
            }
          >
            Back
          </button>
          <button onClick={() => history.push('/')}>Finish</button>
        </div>
      </div>
    </>
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
    <>
      <div className="onboarding-search" ref={groupSearchRef}>
        <InstantSearch
          searchClient={searchClient}
          indexName={abbrEnv + 'GROUPS'}
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
    </>
  );
}
