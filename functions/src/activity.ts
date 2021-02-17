import {firestore} from 'firebase-admin';
import * as functions from 'firebase-functions';
import {admin} from './config';

const db = admin.firestore();

export const resetPostsActivity = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB',
  })
  .pubsub.schedule('every 24 hours')
  .onRun((context) => {
    const collectionRef = db.collection('activity/postActivity/creators');
    const query = collectionRef.limit(50);

    return new Promise((resolve, reject) => {
      deleteQueryBatch(query, resolve).catch(reject);
    });
  });

async function deleteQueryBatch(query: firestore.DocumentData, resolve: any) {
  const snapshot = await query.get();
  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
    return;
  }
  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach((doc: firestore.DocumentSnapshot) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Recurse on the next process tick, to avoid
  // exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(query, resolve);
  });
}
