import {getTitleTextAndBody} from '../components/Forms/Articles/HeaderAndBodyArticleInput';
import {handlePostTopics} from '../components/Topics/TagTopics';
import {convertGroupToGroupRef} from './groups';
import {handleTaggedTopicsNoIDs} from './topics';
import {userToUserRef} from './users';

export default async function addArticleToDB(
  articleText,
  photoURLs,
  selectedTopics,
  selectedGroup,
  userProfile,
  articleDBRef,
  setSubmitting,
  history
) {
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
  articleDBRef
    .set(article)
    .then(() => {
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
