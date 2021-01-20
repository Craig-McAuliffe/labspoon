import {firestore} from 'firebase-admin';
import * as functions from 'firebase-functions';
import {admin} from './config';
import {MAKAuthor} from './microsoft';
import {Publication} from './publications';
import {toUserRef} from './users';

const db = admin.firestore();

export const addMSUserPubsToNewLinkedUser = functions.firestore
  .document('MSUsers/{msUserID}')
  .onUpdate(async (change, context) => {
    const newMSUser = change.after.data() as MAKAuthor;
    const oldMSUser = change.before.data() as MAKAuthor;
    const msUserID = context.params.msUserID;
    if (!oldMSUser.processed && newMSUser.processed) {
      const correspondingUserID = newMSUser.processed;
      const correspondingUser = await db
        .doc(`users/${correspondingUserID}`)
        .get()
        .then((ds) => {
          if (!ds.exists) {
            console.error(
              'no user found with id ' +
                correspondingUserID +
                ' despite being processed on msUser with id ' +
                msUserID
            );
            return;
          }
          return ds.data();
        })
        .catch((err) =>
          console.error(
            'unable to fetch user with id ' + correspondingUserID,
            err
          )
        );
      const msPublicationsQS = await db
        .collection(`MSUsers/${msUserID}/publications`)
        .get()
        .catch((err) =>
          console.error(
            'unable to fetch MSPublications for MSUser with id ' +
              msUserID +
              ' while adding publications to their linked labspoon profile ',
            err
          )
        );

      if (!msPublicationsQS || msPublicationsQS.empty) return;
      const promises: Promise<any>[] = [];
      msPublicationsQS.forEach(async (msPublicationDS) => {
        if (!msPublicationDS.exists) return;
        const correspondingPublicationID = msPublicationDS.data().processed;
        const correspondingPublicationRef = db.doc(
          `publications/${correspondingPublicationID}`
        );
        const correspondingPublicationDS = await correspondingPublicationRef
          .get()
          .catch((err) =>
            console.error(
              'unable to fetch publication with id ' +
                correspondingPublicationID +
                ' while adding that publication to the labspoon author.',
              err
            )
          );
        if (!correspondingPublicationDS || !correspondingPublicationDS.exists) {
          console.error(
            'publication with id ' +
              correspondingPublicationID +
              ' does not exists despite being processed field of mspublication with id ' +
              msPublicationDS.id
          );
          return;
        }
        const correspondingPublication = correspondingPublicationDS.data()! as Publication;
        const batch = db.batch();

        if (correspondingUser) {
          const authorItem = correspondingPublication.authors!.filter(
            (author: any) => author.microsoftID === msUserID
          )[0];
          // updating the publication will automatically set it on the associated user
          if (correspondingPublication.filterAuthorIDs) {
            batch.update(correspondingPublicationRef, {
              filterAuthorIDs: firestore.FieldValue.arrayUnion(
                correspondingUserID
              ),
            });
          } else {
            batch.set(correspondingPublicationRef, {
              filterAuthorIDs: [correspondingUserID],
            });
          }
          if (authorItem) {
            batch.update(correspondingPublicationRef, {
              authors: firestore.FieldValue.arrayRemove(authorItem),
            });
            batch.update(correspondingPublicationRef, {
              authors: firestore.FieldValue.arrayUnion(
                toUserRef(correspondingUserID, correspondingUser)
              ),
            });
          }
          promises.push(batch.commit());
        }
      });
      return Promise.all(promises);
    }
    return;
  });
