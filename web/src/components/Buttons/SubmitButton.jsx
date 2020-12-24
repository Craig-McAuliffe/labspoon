import React from 'react';

import './Buttons.css';
import PrimaryButton from './PrimaryButton';

export default function SubmitButton({inputText, ...props}) {
  return (
    <PrimaryButton submit={true} {...props}>
      {inputText}
    </PrimaryButton>
  );
}
