import React from 'react';
import './OnboardingTipButton.css';

export default function OnboardingTipButton({onClick}) {
  return (
    <button className="onboarding-tip-button" onClick={onClick}>
      <h2>Got it!</h2>
    </button>
  );
}
