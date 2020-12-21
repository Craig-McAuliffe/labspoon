import {getTitleTextAndBody} from '../components/Forms/Articles/HeaderAndBodyArticleInput';
import {handlePostTopics} from '../components/Topics/TagTopics';
import {convertGroupToGroupRef} from './groups';

export default function addArticleToDB(
  articleText,
  photoURLs,
  selectedTopics,
  selectedGroup,
  author,
  researchFocusDBRef,
  setSubmitting,
  history
) {
  const article = {};
  const {customTopics, DBTopics} = handlePostTopics(selectedTopics);
  article.customTopics = customTopics;
  article.topics = DBTopics;
  article.group = convertGroupToGroupRef(selectedGroup);
  article.photoURLs = photoURLs;
  article.author = author;
  const [title, body] = getTitleTextAndBody(articleText);
  article.title = title;
  article.body = body;
  article.timestamp = new Date();
  researchFocusDBRef
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
