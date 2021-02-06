import React from 'react';
import PrimaryButton from '../Buttons/PrimaryButton';
import CancelButton from '../Buttons/CancelButton';

import './CreateResourceFormActions.css';

export default function CreateResourceFormActions({
  submitText,
  submitting,
  cancelForm,
  formID,
  customAction,
}) {
  return (
    <div className="create-group-submit-cancel-container">
      <div>
        {cancelForm ? <CancelButton cancelAction={cancelForm} /> : null}
      </div>
      <div>
        <PrimaryButton
          submit={customAction ? false : true}
          formID={formID}
          disabled={submitting}
          onClick={customAction}
        >
          {submitText}
        </PrimaryButton>
      </div>
    </div>
  );
}
