import React, {useContext, useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {AuthContext} from '../../App';
import {RemoveIcon} from '../../assets/GeneralActionIcons';
import {db} from '../../firebase';
import OnboardingTipButton from '../Buttons/OnboardingTipButton';

import './OnboardingTip.css';

export default function OnboardingTip({text, onboardingCheckFieldName}) {
  const {user, userProfile, authLoaded} = useContext(AuthContext);
  const userID = user ? user.uid : undefined;
  const [displayTip, setDisplayTip] = useState();
  const pathName = useLocation().pathname;
  useEffect(() => {
    if (!userID) return;
    db.doc(`users/${userID}`)
      .get()
      .then((doc) => {
        if (!doc.exists) {
          return;
        }
        if (doc.data()[onboardingCheckFieldName]) {
          setDisplayTip(false);
          return;
        }
        setDisplayTip(true);
      });
  }, [userID, onboardingCheckFieldName, text, user, authLoaded, userProfile]);

  const setOnboardingTipChecked = () => {
    db.doc(`users/${userID}`)
      .update({[onboardingCheckFieldName]: true})
      .then(() => setDisplayTip(false))
      .catch((err) => console.error(err));
  };
  if (!userID) return null;
  if (!displayTip) return null;
  if (pathName !== '/') return null;
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
