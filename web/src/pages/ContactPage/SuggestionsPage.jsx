import React from 'react';
import {GenericContactPage} from './ContactPage';

export default function SuggestionsPage() {
  return (
    <GenericContactPage
      contactFormType="suggestion"
      mainLabel="Your Suggestion"
    >
      We&#39;d love to hear your suggestions for Labspoon! If you are
      encountering a problem, please fill out the form on{' '}
    </GenericContactPage>
  );
}
