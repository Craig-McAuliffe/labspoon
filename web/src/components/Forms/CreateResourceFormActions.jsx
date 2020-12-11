import React from 'react';
import PrimaryButton from '../Buttons/PrimaryButton';
import CancelButton from '../Buttons/CancelButton';

import './CreateResourceFormActions.css';

export default function CreateResourceFormActions({
  submitText,
  submitted,
  cancelForm,
}) {
  return (
    <div className="create-group-submit-cancel-container">
      <div>
        {cancelForm ? <CancelButton cancelAction={cancelForm} /> : null}
      </div>
      <div>
        <PrimaryButton submit formID="create-group-form" disabled={submitted}>
          {submitText}
        </PrimaryButton>
      </div>
    </div>
  );
}
