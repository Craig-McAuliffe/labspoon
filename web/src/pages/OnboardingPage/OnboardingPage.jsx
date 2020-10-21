import React, {useEffect, useState, useContext, useRef} from 'react';
import {useHistory, useLocation, useParams} from 'react-router-dom';
import {AuthContext} from '../../App';
import {db} from '../../firebase';
import {getPaginatedUserReferencesFromCollectionRef} from '../../helpers/users';
import {getPaginatedTopicsFromCollectionRef} from '../../helpers/topics';
import {getPaginatedGroupReferencesFromCollectionRef} from '../../helpers/groups';
import TopicListItem from '../../components/Topics/TopicListItem';
import FollowTopicButton from '../../components/Topics/FollowTopicButton';
import GroupListItem from '../../components/Group/GroupListItem';
import FollowUserButton from '../../components/User/FollowUserButton/FollowUserButton';
import SecondaryButton from '../../components/Buttons/SecondaryButton';
import {CreateGroupIcon} from '../../assets/MenuIcons';
import CreateGroupPage from '../Groups/CreateGroupPage/CreateGroupPage';
import UserListItem from '../../components/User/UserListItem';
import FormDatabaseSearch from '../../components/Forms/FormDatabaseSearch';
import SuccessMessage from '../../components/Forms/SuccessMessage';
import {SearchIconGrey} from '../../assets/HeaderIcons';
import firebase from '../../firebase';

import './OnboardingPage.css';
import PrimaryButton from '../../components/Buttons/PrimaryButton';

const getSuggestedPublicationsForAuthorName = firebase
  .functions()
  .httpsCallable('users-getSuggestedPublicationsForAuthorName');
const setMicrosoftAcademicIDByPublicationMatches = firebase
  .functions()
  .httpsCallable('users-setMicrosoftAcademicIDByPublicationMatches');
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
          <OnboardingAuthorLink
            nextOnboardingStage={nextOnboardingStage}
            user={user}
          />
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
            onClick={() => nextOnboardingStage()}
          >
            Skip
          </button>
          <div>
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
          <FormDatabaseSearch
            setDisplayedItems={setDisplayedUsers}
            inputRef={userSearchRef}
            indexName="_USERS"
            placeholderText="Find researchers"
            displayedItems={displayedUsers}
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
          <FormDatabaseSearch
            setDisplayedItems={setDisplayedTopics}
            inputRef={topicSearchRef}
            indexName="_TOPICS"
            placeholderText="Find topics"
            displayedItems={displayedTopics}
          />
          <div className="onboarding-topics-to-follow-container">
            {displayedTopics.map((displayedTopic) => (
              <TopicListItem topic={displayedTopic} key={displayedTopic.id}>
                <FollowTopicButton targetTopic={displayedTopic} />
              </TopicListItem>
            ))}
          </div>
        </div>
      </div>
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
        <FormDatabaseSearch
          setDisplayedItems={setDisplayedGroups}
          inputRef={groupSearchRef}
          indexName="_GROUPS"
          placeholderText="Find your group"
          displayedItems={displayedGroups}
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
            onboardingConfirmGroupCreation={() => setConfirmGroupCreation(true)}
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
            <SuccessMessage>
              Group Created! You can find it in the top right menu.
            </SuccessMessage>
          ) : null}
        </>
      )}
    </div>
  );
}

function OnboardingAuthorLink({user, nextOnboardingStage}) {
  const [linkingAuthor, setLinkingAuthor] = useState(false);
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
        <LinkAuthorIDForm />
      )}
    </div>
  );
}

function LinkAuthorIDForm() {
  const [name, setName] = useState('');
  const [suggestedPublications, setSuggestedPublications] = useState([]);
  const [loadingState, setLoadingState] = useState();

  const searchProgress = () => {
    if (loadingState === 'loading') return <h4>Loading Publications</h4>;
    if (loadingState === 'error')
      return (
        <h4>Something went wrong, sorry about that. Please try again later.</h4>
      );
    if (loadingState === 'loaded') return null;
  };

  return (
    <div>
      <h3 className="onboarding-author-link-explain">
        Connect your Labspoon account to your publications
      </h3>
      <form
        className="onboarding-author-link-form"
        onSubmit={(e) => {
          e.preventDefault();
          setLoadingState('loading');
          getSuggestedPublicationsForAuthorName({
            name: name,
          })
            .then((fetchedSuggestedPublications) => {
              setLoadingState('loaded');
              setSuggestedPublications(fetchedSuggestedPublications.data);
            })
            .catch((err) => {
              console.log(err);
              setLoadingState('error');
            });
        }}
      >
        <label>
          Your name as it appears on publications
          <input
            type="text"
            className="onboarding-author-name-input"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            type="submit"
            value="Submit Search"
            className="onboarding-author-link-button"
          >
            <SearchIconGrey />
            <span className="onboarding-author-link-search-button-text">
              Search
            </span>
          </button>
        </label>
      </form>
      {searchProgress()}
      {suggestedPublications.length > 0 ? (
        <SuggestedPublications suggestedPublications={suggestedPublications} />
      ) : null}
    </div>
  );
}

function SuggestedPublications({suggestedPublications}) {
  const history = useHistory();
  const [
    selectedPublicationsAuthorID,
    setSelectedPublicationsAuthorID,
  ] = useState();

  const suggestedPublicationItems = () =>
    suggestedPublications.map((suggestedPublication, i) => {
      if (!suggestedPublication) return null;
      return (
        <React.Fragment key={suggestedPublication.publicationInfo.title + i}>
          <div className="onboarding-suggested-publication-title-container">
            <h4 className="onboarding-suggested-publication-title">
              {suggestedPublication.publicationInfo.title}
            </h4>
            {suggestedPublication.publicationInfo.authors.map((author, i) => {
              if (i > 6) {
                if (
                  i ===
                  suggestedPublication.publicationInfo.authors.length - 1
                )
                  return (
                    <p
                      key={author.id}
                      className="onboarding-suggested-publication-authors"
                    >
                      ...and {i + 1} more.
                    </p>
                  );
                return;
              }
              return (
                <p
                  key={author.id}
                  className="onboarding-suggested-publication-authors"
                >
                  {author.name}
                  {i === suggestedPublication.publicationInfo.authors.length - 1
                    ? null
                    : ','}
                </p>
              );
            })}
          </div>
          <div className="post-selector-container">
            <button
              className={
                selectedPublicationsAuthorID ===
                suggestedPublication.microsoftAcademicIDMatch
                  ? 'onboarding-publication-selector-button-selected'
                  : 'onboarding-publication-selector-button'
              }
              type="button"
              onClick={() => {
                if (
                  suggestedPublication.microsoftAcademicIDMatch ===
                  selectedPublicationsAuthorID
                )
                  setSelectedPublicationsAuthorID(undefined);
                else
                  setSelectedPublicationsAuthorID(
                    suggestedPublication.microsoftAcademicIDMatch
                  );
              }}
            />
          </div>
        </React.Fragment>
      );
    });

  return (
    <>
      <div className="onboarding-suggested-publications-container">
        {suggestedPublicationItems()}
      </div>
      <div className="onboarding-suggested-publications-submit-container">
        <PrimaryButton
          type="button"
          onClick={() => {
            setMicrosoftAcademicIDByPublicationMatches({
              microsoftAcademicAuthorID: selectedPublicationsAuthorID,
            });
            history.push(`/onboarding/${GROUPS}`);
          }}
        >
          Link Papers to Profile
        </PrimaryButton>
      </div>
    </>
  );
}
