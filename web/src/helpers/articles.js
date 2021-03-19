import {db, firebaseFirestoreOptions} from '../firebase';
import {convertGroupToGroupRef} from './groups';
import {RESEARCHFOCUSES, TECHNIQUES} from './resourceTypeDefinitions';
import {userToUserRef} from './users';

const MAX_ARTICLE_TYPE_PER_GROUP = 20;
export default async function addArticleToDB(
  title,
  body,
  photoURLs,
  selectedTopics,
  selectedGroup,
  userProfile,
  articleDBRef,
  articleOnGroupRef,
  setSubmitting,
  history,
  resourceTypePlural,
  countFieldName,
  failFunction
) {
  const fullGroupDoc = await db
    .doc(`groupsStats/${selectedGroup.id}`)
    .get()
    .catch((err) =>
      console.error(
        `unable to fetch article count for group with id ${selectedGroup.id} ${err}`
      )
    );
  if (!fullGroupDoc) {
    alert('Something went wrong. Sorry about that. Please try again.');
    failFunction();
    setSubmitting(false);
    return;
  }
  if (fullGroupDoc.exists) {
    const articleCount = fullGroupDoc.data()[countFieldName];
    if (articleCount && articleCount >= MAX_ARTICLE_TYPE_PER_GROUP) {
      alert(
        `You have reached the maximum number of ${resourceTypeToWord(
          resourceTypePlural
        )} for this group. You must delete at least one in order to make another.`
      );
      failFunction();
      setSubmitting(false);
      return;
    }
  }
  const article = {};
  article.topics = selectedTopics;
  article.filterTopicIDs = selectedTopics.map((topic) => topic.id);
  article.group = convertGroupToGroupRef(selectedGroup);
  article.photoURLs = photoURLs;
  article.author = userToUserRef(userProfile, userProfile.id);
  article.title = title;
  article.body = body;
  article.timestamp = new Date();
  article.unixTimeStamp = Math.floor(new Date().getTime() / 1000);
  const batch = db.batch();
  batch.set(articleDBRef, article);
  batch.set(articleOnGroupRef, article);

  return batch
    .commit()
    .then(async () => {
      await db
        .doc(`groupsStats/${selectedGroup.id}`)
        .set(
          {
            [countFieldName]: firebaseFirestoreOptions.FieldValue.increment(1),
          },
          {merge: true}
        )
        .catch((err) =>
          console.error(
            `unable to add article count to group with id ${selectedGroup.id} ${err}`
          )
        );
      history.push(`/group/${selectedGroup.id}/${resourceTypePlural}`);
    })
    .catch((err) => {
      console.error(err);
      failFunction();
      alert('Something went wrong Sorry about that. Please try again later.');
      setSubmitting(false);
    });
}

function resourceTypeToWord(resourceTypePlural) {
  switch (resourceTypePlural) {
    case RESEARCHFOCUSES:
      return 'research focuses';
    case TECHNIQUES:
      return 'techniques';
    default:
      'articles';
  }
}

export function getArticleLengthFromBody(body) {
  return body.reduce((accumulator, current) => {
    // + 1 is for the paragraph break character itself
    return accumulator + current.children[0].text.length + 1;
  }, 0);
}
