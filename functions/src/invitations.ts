import * as functions from 'firebase-functions';
import {admin} from './config';
import {toUserRef, UserRef} from './users';
import {firestore} from 'firebase-admin';
import {sendGroupInvitationEmail} from './email';

const db = admin.firestore();

export enum InvitationType {
  GROUP = 'group',
}

export interface Invitation {
  email: string;
  type: InvitationType;
  resourceID: string;
  invitingUserID: string;
}

export const addInvitationFromGroup = functions.firestore
  .document('groups/{groupID}/invitations/{invitationID}')
  .onCreate(async (change, context) => {
    const invitation = change.data() as Invitation;
    const invitationID = change.id;
    await sendGroupInvitationEmail(invitationID, invitation);
    return;
  });

export const removeInvitationFromGroup = functions.firestore
  .document('groups/{groupID}/invitations/{invitationID}')
  .onDelete(async (change) => {
    await db.doc(`invitations/group/newMemberInvites/${change.id}`).delete();
    return;
  });

export const fulfillInvitationsOnEmailSignUp = functions.firestore
  .document(`users/{userID}`)
  .onCreate(async (change) => {
    const userID = change.id;
    const authUser = await admin
      .auth()
      .getUser(userID)
      .catch((err: Error) =>
        console.error(`Error fetching user data for user ${userID}:`, err)
      );
    if (!authUser) {
      console.error(`User not found for user ID ${userID} after post creation`);
      return;
    }
    const email = authUser.email;

    const userRef = toUserRef(userID, change.data());

    const invitationsQS = await db
      .collection('invitations')
      .where('email', '==', email)
      .get();
    if (invitationsQS.empty) return;
    const fulfillInvitationPromises = [];
    invitationsQS.forEach((doc) => {
      const invitation = doc.data() as Invitation;
      const invitationDocRef = doc.ref;
      switch (invitation.type) {
        case InvitationType.GROUP:
          fulfillInvitationPromises.push(
            fulfillGroupInvitation(userRef, invitationDocRef, invitation)
          );
          break;
        default:
          throw new Error('Unknown invitation type');
      }
    });
  });

async function fulfillGroupInvitation(
  userRef: UserRef,
  invitationDocRef: firestore.DocumentReference<firestore.DocumentData>,
  invitation: Invitation
) {
  const groupID = invitation.resourceID;
  const userID = userRef.id;
  const batch = db.batch();
  batch.set(db.doc(`groups/${groupID}/members/${userID}`), userRef);
  batch.delete(invitationDocRef);
  batch.delete(db.doc(`groups/${groupID}/invitations/${invitationDocRef.id}`));
  await batch.commit();
}
