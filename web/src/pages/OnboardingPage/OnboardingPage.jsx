import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';

export default function OnboardingPage() {
  const [onboardingStage, setOnboardingStage] = useState(0);
  const OnboardingStageDisplay = () => {
    switch (onboardingStage) {
      case 0:
        return (
          <div>
            <OnboardingFollow setOnboardingStage={setOnboardingStage} />
          </div>
        );
      case 1:
        return (
          <div>
            <OnboardingGroup setOnboardingStage={setOnboardingStage} />
          </div>
        );
      case 2:
        return (
          <div>
            <OnboardingPost />
          </div>
        );
      case 4:
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

function OnboardingFollow({setOnboardingStage}) {
  return (
    <>
      <div>
        Labspoon is all about finding research that interests you and following
        for updates. Why not follow a few topics now.
      </div>
      <div className="onboarding-skip-next-container">
        <button>Skip</button>
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

function OnboardingGroup({setOnboardingStage}) {
  return (
    <>
      <div>
        Are you part of a research group? Search for it on Labspoon or create
        one.
      </div>
      <div className="onboarding-skip-next-container">
        <button>Skip</button>
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

function OnboardingPost({}) {
  const history = useHistory();
  return (
    <>
      <div>{`Why not tell everyone that you've joined Labspoon?`}</div>
      <div className="onboarding-skip-next-container">
        <button>Skip</button>
        <button onClick={() => history.push('/')}>Finish</button>
      </div>
    </>
  );
}
