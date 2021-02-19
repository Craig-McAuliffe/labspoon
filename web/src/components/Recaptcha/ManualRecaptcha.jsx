import React, {useContext} from 'react';
import {BotDetector} from '../../App';
import {PaddedPageContainer} from '../Layout/Content';

import './ManualRecaptcha.css';

export default function ManualRecaptcha({successFunction}) {
  const {setBotConfirmed} = useContext(BotDetector);
  return (
    <PaddedPageContainer>
      <h4>Recaptcha</h4>Our sensors indicate that you might be a bot. Bots are
      not allowed to contact us. Are you a bot?
      <div>
        <button
          onClick={() => setBotConfirmed(true)}
          className="manual-recaptcha-not-a-human-button"
        >
          Yes I am a bot
        </button>{' '}
        <button
          onClick={() => successFunction()}
          className="manual-recaptcha-not-a-bot-button"
        >
          No, I am not a bot
        </button>
      </div>
    </PaddedPageContainer>
  );
}
