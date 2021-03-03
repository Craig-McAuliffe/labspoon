import {getTitleTextAndBody} from '../components/Forms/Articles/HeaderAndBodyArticleInput';
import {handlePostTopics} from '../components/Topics/TagTopics';
import {db, firebaseFirestoreOptions} from '../firebase';
import {convertGroupToGroupRef} from './groups';
import {RESEARCHFOCUSES, TECHNIQUES} from './resourceTypeDefinitions';
import {handleTaggedTopicsNoIDs} from './topics';
import {userToUserRef} from './users';

const MAX_ARTICLE_TYPE_PER_GROUP = 20;
export default async function addArticleToDB(
  articleText,
  photoURLs,
  selectedTopics,
  selectedGroup,
  userProfile,
  articleDBRef,
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
  const {customTopics, DBTopics} = handlePostTopics(selectedTopics);
  article.customTopics = customTopics;
  const taggedTopicsArray = [];
  await handleTaggedTopicsNoIDs(DBTopics, taggedTopicsArray);
  article.topics = taggedTopicsArray;
  article.filterTopicIDs = taggedTopicsArray.map((topic) => topic.id);
  article.group = convertGroupToGroupRef(selectedGroup);
  article.photoURLs = photoURLs;
  article.author = userToUserRef(userProfile, userProfile.id);
  const [title, body] = getTitleTextAndBody(articleText);
  article.title = title;
  article.body = body;
  article.timestamp = new Date();
  article.unixTimeStamp = Math.floor(new Date().getTime() / 1000);
  articleDBRef
    .set(article)
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
      history.push(`/group/${selectedGroup.id}`);
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
