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
  noBorder,
}) {
  return (
    <div
      className={`create-resource-submit-cancel-container${
        noBorder ? '-no-border' : ''
      }`}
    >
      <div>
        {cancelForm && !submitting && (
          <CancelButton cancelAction={cancelForm} />
        )}
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
