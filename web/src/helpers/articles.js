import {getTitleTextAndBody} from '../components/Forms/Articles/HeaderAndBodyArticleInput';
import {handlePostTopics} from '../components/Topics/TagTopics';
import {db} from '../firebase';
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
  countFieldName
) {
  const fullGroupDoc = await db
    .doc(`groups/${selectedGroup.id}`)
    .get()
    .catch((err) =>
      console.error(
        `unable to fetch article count for group with id ${selectedGroup.id} ${err}`
      )
    );
  if (!fullGroupDoc || !fullGroupDoc.exists) {
    alert(
      'Something went wrong trying to create the research focus. Sorry about that. Please try again later.'
    );
    setSubmitting(false);
    return;
  }
  const articleCount = fullGroupDoc.data()[countFieldName];
  if (articleCount && articleCount >= MAX_ARTICLE_TYPE_PER_GROUP) {
    alert(
      `You have reached the maximum number of ${resourceTypeToWord(
        resourceTypePlural
      )} for this group. You must delete at least one in order to make another.`
    );
    setSubmitting(false);
    return;
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
        .doc(`groups/${selectedGroup.id}`)
        .update({
          [countFieldName]: articleCount ? articleCount + 1 : 1,
        })
        .catch((err) =>
          console.error(
            `unable to add article count to group with id ${selectedGroup.id}`
          )
        );
      setSubmitting(false);
      history.push(`/group/${selectedGroup.id}`);
    })
    .catch((err) => {
      console.error(err);
      alert(
        'Something went wrong trying to create the research focus. Sorry about that. Please try again later.'
      );
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
