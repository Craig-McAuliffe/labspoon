import * as functions from 'firebase-functions';
import {admin} from './config';

import {MAKField} from './microsoft';
import {
  Topic,
  TaggedTopic,
  createFieldAndTopic,
  convertTopicToTaggedTopic,
} from './topics';
import {UserRef} from './users';
import {createMSTopic, authorFromContext} from './posts';

const db = admin.firestore();

export const createOpenPosition = functions.https.onCall(
  async (data, context) => {
    const author = await authorFromContext(context);
    const openPositionRef = db.collection('openPositions').doc();
    const openPositionID = openPositionRef.id;

    const content: OpenPositionContent = {
      title: data.title,
      address: data.address,
      salary: data.salary,
      startDate: data.startDate,
      applyEmail: data.applyEmail,
      applyLink: data.applyLink,
      description: data.description,
    };

    const openPositionTopics: TaggedTopic[] = [];
    const matchedTopicsPromises = data.topics.map((taggedTopicNoID: Topic) => {
      return db
        .doc(`MSFields/${taggedTopicNoID.microsoftID}`)
        .get()
        .then((ds) => {
          function addTopicToOpenPosition(
            correspondingLabspoonTopicID: string
          ) {
            openPositionTopics.push(
              convertTopicToTaggedTopic(
                taggedTopicNoID,
                correspondingLabspoonTopicID
              )
            );
          }
          if (ds.exists) {
            const MSFieldData = ds.data() as MAKField;
            if (MSFieldData.processed) {
              addTopicToOpenPosition(MSFieldData.processed);
            } else {
              // This should not be possible. All dbMSFields should be processed
              // upon creation.
              console.error(
                'no Labspoon topic corresponding to MSField ' +
                  taggedTopicNoID.microsoftID
              );
              createMSTopic(MSFieldData);
            }
          } else {
            createFieldAndTopic(taggedTopicNoID)
              .then((labspoonTopicID) => {
                if (labspoonTopicID === undefined) {
                  console.error(
                    `topic with microsoftID ${taggedTopicNoID.microsoftID} was created but did not return the corresponding labspoon ID`
                  );
                  return false;
                } else {
                  addTopicToOpenPosition(labspoonTopicID);
                  return true;
                }
              })
              .catch((err) =>
                console.error(
                  `field ${taggedTopicNoID.microsoftID} is not in database and could not be created ${err}`
                )
              );
          }
        });
    });
    await Promise.all(matchedTopicsPromises);
    const processedOpenPosition: OpenPosition = {
      author: author,
      content: content,
      topics: openPositionTopics,
      customTopics: data.customTopics,
      timestamp: new Date(),
      filterTopicIDs: openPositionTopics.map(
        (taggedTopic: TaggedTopic) => taggedTopic.id
      ),
    };
    await openPositionRef.set(processedOpenPosition).catch((err) => {
      console.error(
        `could not create open position with id ${openPositionID}` + err
      );
      throw new functions.https.HttpsError(
        'internal',
        'An error occured while creating the open position.'
      );
    });
  }
);

interface OpenPosition {
  content: OpenPositionContent;
  author: UserRef;
  topics?: TaggedTopic[];
  customTopics?: string[];
  timestamp: Date;
  // filterable arrays must be array of strings
  filterTopicIDs: string[];
}

interface OpenPositionContent {
  title: string;
  address: string;
  salary: string;
  startDate: string;
  applyEmail: string;
  applyLink: string;
  description: string;
}
