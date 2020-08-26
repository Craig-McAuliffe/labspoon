import getFilteredPosts from '../../../mockdata/posts';
import publications from '../../../mockdata/publications';
import users from '../../../mockdata/users';
import groups from '../../../mockdata/groups';

export default function postPageFeedData(skip, limit, filterOptions, post) {
  const postTopics = post.topics;

  let resultsList = [];

  let activeTab;
  if (filterOptions.length === 0) {
    activeTab = [];
  } else {
    activeTab = filterOptions[0].options.filter(
      (filterOption) => filterOption.enabled === true
    );
  }

  const relatedPosts = () =>
    getFilteredPosts([
      {
        collectionName: 'Topics',
        options: postTopics.map((postTopic) => ({
          enabled: true,
          data: {
            id: postTopic.id,
            name: postTopic.name,
          },
        })),
      },
    ]);

  const relatedPublications = () => publications();
  const relatedUsers = () => users();
  const relatedGroups = () => groups();

  if (activeTab.length > 0) {
    const activeTabID = activeTab[0].data.id;
    switch (activeTabID) {
      case filterOptions[0].options[0].data.id:
        resultsList = [...resultsList, ...relatedPosts()];
        break;
      case filterOptions[0].options[1].data.id:
        resultsList = [...resultsList, ...relatedPublications()];
        break;
      case filterOptions[0].options[2].data.id:
        resultsList = [...resultsList, ...relatedUsers()];
        break;
      case filterOptions[0].options[3].data.id:
        resultsList = [...resultsList, ...relatedGroups()];
        break;
      default:
        resultsList = [];
    }
  }
  return resultsList;
}
