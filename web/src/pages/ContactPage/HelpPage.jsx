import React from 'react';
import {GenericContactPage} from './ContactPage';

export default function HelpPage() {
  return (
    <GenericContactPage contactFormType="help" mainLabel="How can we help?">
      We&#39;re here to help. Just send us a message and we&#39;ll get back to
      you as soon as possible.
    </GenericContactPage>
  );
}
