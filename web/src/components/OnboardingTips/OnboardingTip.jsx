import React, {useEffect, useState} from 'react';
import {RemoveIcon} from '../../assets/GeneralActionIcons';
import {db} from '../../firebase';
import OnboardingTipButton from '../Buttons/OnboardingTipButton';

import './OnboardingTip.css';

export default function OnboardingTip({
  text,
  userID,
  onboardingCheckFieldName,
}) {
  const [displayTip, setDisplayTip] = useState();
  useEffect(
    () => {
      db.doc(`users/${userID}`)
        .get()
        .then((doc) => {
          if (!doc.exists) return;
          if (doc.data()[onboardingCheckFieldName]) {
            setDisplayTip(false);
            return;
          }
          setDisplayTip(true);
        });
    },
    userID,
    onboardingCheckFieldName,
    text
  );

  const setOnboardingTipChecked = () => {
    db.doc(`users/${userID}`)
      .update({[onboardingCheckFieldName]: true})
      .then(() => setDisplayTip(false))
      .catch((err) => console.error(err));
  };

  if (!displayTip) return null;
  return (
    <div className="onboarding-tip-popup-container">
      <div className="onboarding-tip-cancel-container">
        <button onClick={setOnboardingTipChecked}>
          <RemoveIcon />
        </button>
      </div>
      <p>{text}</p>
      <div className="onboarding-tip-confirm-container">
        <OnboardingTipButton onClick={setOnboardingTipChecked} />
      </div>
    </div>
  );
}
