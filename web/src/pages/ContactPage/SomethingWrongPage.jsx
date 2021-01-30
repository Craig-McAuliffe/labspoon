import React from 'react';
import {GenericContactPage} from './ContactPage';

export default function SomethingWrongPage() {
  return (
    <GenericContactPage
      contactFormType="somethingWrong"
      mainLabel="What's wrong?"
    >
      Sorry that you have encountered a problem. Send us a message and we&#39;ll
      solve it as soon as possible.
    </GenericContactPage>
  );
}
