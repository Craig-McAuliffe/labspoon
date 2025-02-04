import React, {useState, useContext} from 'react';
import {Redirect, useHistory, useLocation, useParams} from 'react-router-dom';
import {AuthContext} from '../../App';
import {db} from '../../firebase';
import SecondaryButton from '../../components/Buttons/SecondaryButton';
import CreateGroupPage from '../../components/Group/CreateGroupPage/CreateGroupPage';
import {PaddedPageContainer} from '../../components/Layout/Content';
import TertiaryButton from '../../components/Buttons/TertiaryButton';

import './OnboardingPage.css';

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
  if (user === undefined) history.push('/signup');

  const OnboardingStageDisplay = () => {
    switch (onboardingStage) {
      case GROUPS:
        return (
          <OnboardingGroup
            userDetails={userProfile}
            claimGroupID={claimGroupID}
            returnLocation={returnLocation}
            onboardingStage={onboardingStage}
            nextOnboardingStage={nextOnboardingStage}
          />
        );
      default:
        return <p>Hmm, something has gone wrong. Try refreshing your page.</p>;
    }
  };

  const nextOnboardingStage = () => {
    switch (onboardingStage) {
      case GROUPS:
        return completeOnboardingThenRedirect(
          history,
          userProfile.id,
          returnLocation
        );

      default:
        return completeOnboardingThenRedirect(
          history,
          userProfile.id,
          returnLocation
        );
    }
  };

  if (onboardingStage !== GROUPS)
    return (
      <Redirect
        to={{
          pathname: '/onboarding/groups',
          state: locationState,
        }}
      />
    );
  return (
    <PaddedPageContainer>
      <h2 className="onboarding-main-title">Welcome to Labspoon!</h2>
      <OnboardingStageDisplay />
    </PaddedPageContainer>
  );
}

function NextOrBackOnboardingActions({
  nextOnboardingStage,
  creatingGroup,
  onboardingStage,
}) {
  return (
    <div className="onboarding-skip-next-container">
      <div></div>
      <div className="onboarding-next-back-container">
        {creatingGroup && onboardingStage === GROUPS ? null : (
          <SecondaryButton onClick={() => nextOnboardingStage()}>
            {onboardingStage === GROUPS ? 'Finish' : 'Next'}
          </SecondaryButton>
        )}
      </div>
    </div>
  );
}
async function completeOnboardingThenRedirect(
  history,
  userID,
  returnLocation,
  customLocation
) {
  return db
    .doc(`users/${userID}`)
    .update({hasCompletedOnboarding: true})
    .then(() => {
      if (customLocation) return history.push(customLocation);
      return history.push(returnLocation ? returnLocation : '/');
    })
    .catch((err) => {
      console.error(err);
      if (customLocation) return history.push(customLocation);
      return history.push(returnLocation ? returnLocation : '/');
    });
}

function OnboardingGroup({
  userDetails,
  claimGroupID,
  returnLocation,
  onboardingStage,
  nextOnboardingStage,
}) {
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [createdGroupID, setCreatedGroupID] = useState(false);
  const [isInGroup, setIsInGroup] = useState(null);

  const history = useHistory();

  let createOrClaimGroup = creatingGroup ? (
    <CreateGroupPage
      onboardingCancelOrSubmitAction={() => setCreatingGroup(false)}
      setCreatedGroupID={setCreatedGroupID}
    />
  ) : (
    <>
      <h4>{`Group pages are a great place to share updates from the lab.`}</h4>
      <div className="onboarding-create-group-button-container">
        <SecondaryButton onClick={() => setCreatingGroup(true)}>
          Create a group
        </SecondaryButton>
      </div>
      <p className="onboarding-hint-do-it-later">
        {`Short for time? Don't worry, you can always make one later.`}
      </p>
    </>
  );
  if (claimGroupID)
    createOrClaimGroup = (
      <div className="go-to-claimed-group-section">
        <h2>
          <TertiaryButton
            onClick={() =>
              completeOnboardingThenRedirect(
                history,
                userDetails.id,
                returnLocation,
                `/group/${claimGroupID}`
              )
            }
          >
            Go to claimed group
          </TertiaryButton>
        </h2>
      </div>
    );
  if (createdGroupID)
    createOrClaimGroup = (
      <div className="go-to-claimed-group-section">
        <h2>
          <TertiaryButton
            onClick={() =>
              completeOnboardingThenRedirect(
                history,
                userDetails.id,
                returnLocation,
                `/group/${createdGroupID}`
              )
            }
          >
            Go to created group
          </TertiaryButton>
        </h2>
      </div>
    );

  let content = (
    <>
      <h3>Are you part of a research group?</h3>
      <div className="onboarding-author-papers-choice-container">
        <div className="onboarding-author-papers-choice-button-container">
          <SecondaryButton
            onClick={() => setIsInGroup(true)}
            width="100px"
            height="60px"
          >
            Yes
          </SecondaryButton>
        </div>
        <div className="onboarding-author-papers-choice-button-container">
          <SecondaryButton
            onClick={() => {
              nextOnboardingStage();
            }}
            width="100px"
            height="60px"
          >
            No
          </SecondaryButton>
        </div>
      </div>
    </>
  );

  if (isInGroup) content = createOrClaimGroup;
  if (isInGroup === false) content = null;
  return (
    <div>
      {content}
      <NextOrBackOnboardingActions
        onboardingStage={onboardingStage}
        nextOnboardingStage={nextOnboardingStage}
        creatingGroup={creatingGroup}
      />
    </div>
  );
}
