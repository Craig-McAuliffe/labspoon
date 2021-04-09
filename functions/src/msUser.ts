import {firestore} from 'firebase-admin';
import * as functions from 'firebase-functions';
import {admin, environment} from './config';
import {
  fetchAndHandlePublicationsForAuthor,
  MAKAuthor,
  User,
} from './microsoft';
import {Publication} from './publications';
import {toUserPublicationRef} from './users';

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
          return ds.data() as User;
        })
        .catch((err) =>
          console.error(
            'unable to fetch user with id ' + correspondingUserID,
            err
          )
        );
      if (!correspondingUser) return;
      // this should never happen as it is batched with processed field
      if (!correspondingUser.microsoftID) {
        console.error(
          `MSUser with ID ${msUserID} is linked to user with id ${correspondingUserID} yet the user has no microsoftID`
        );
        return;
      }
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
              ' might not exist despite being processed field of mspublication with id ' +
              msPublicationDS.id
          );
          return;
        }
        const correspondingPublication = correspondingPublicationDS.data()! as Publication;
        const batch = db.batch();

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
              toUserPublicationRef(
                correspondingUser.name,
                correspondingUser.microsoftID!,
                correspondingUserID
              )
            ),
          });
        }
        promises.push(batch.commit());
      });
      return Promise.all(promises);
    }
    return;
  });

// make this on pubsub. pubsub topic trigger should be the linking function
export const fetchPublicationsForNewLinkedUser = functions.firestore
  .document('MSUsers/{msUserID}')
  .onUpdate(async (change) => {
    const newUserData = change.after.data() as MAKAuthor;
    const oldUserData = change.before.data() as MAKAuthor;
    if (newUserData.processed && !oldUserData.processed) {
      const expression = `Composite(AA.AuId=${newUserData.AuId})`;
      const count = environment === 'local' ? 2 : 50;
      const offset = 0;
      return fetchAndHandlePublicationsForAuthor(expression, count, offset);
    }
    return;
  });
