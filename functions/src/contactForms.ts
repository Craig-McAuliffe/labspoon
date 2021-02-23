import {firestore} from 'firebase-admin';
import * as functions from 'firebase-functions';
import {admin} from './config';

const db = admin.firestore();

export const decreaseContactFormCountOnDelete = functions.firestore
  .document('contactForms/{formType}/submittedForms/{formID}')
  .onDelete((change, context) => {
    const formType = context.params.formType;
    return db
      .doc(`contactForms/${formType}`)
      .update({numberOfMessages: firestore.FieldValue.increment(-1)})
      .catch((err) =>
        console.error(
          `unable to decrement contact form count for formtype ${formType} ${err}`
        )
      );
  });
