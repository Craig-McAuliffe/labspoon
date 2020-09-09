import getFilteredPosts from '../../mockdata/posts';
import publications from '../../mockdata/publications';
import groups from '../../mockdata/groups';
import users from '../../mockdata/users';

export default function topicPageFeedData(skip, limit, filterOptions, topic) {
  let resultsList = [];

  const relatedPosts = () =>
    getFilteredPosts([
      {
        collectionName: 'Topics',
        options: [
          {
            enabled: true,
            data: {
              id: topic.id,
              name: topic.name,
            },
          },
        ],
      },
    ]);

  const relatedPublications = () => publications().slice(skip, skip + limit);

  const relatedUsers = () => users().slice(skip, skip + limit);

  const relatedGroups = () => groups().slice(skip, skip + limit);

  let activeTab;
  if (filterOptions.length === 0) {
    activeTab = [];
  } else {
    activeTab = filterOptions[0].options.filter(
      (filterOption) => filterOption.enabled === true
    );
  }

  if (activeTab.length > 0) {
    const activeTabID = activeTab[0].data.id;
    switch (activeTabID) {
      case 'overview':
        resultsList = [
          ...resultsList,
          ...relatedPosts(),
          ...relatedPosts(),
          ...relatedPublications(),
          ...relatedUsers(),
          ...relatedGroups(),
        ];
        break;
      case 'posts':
        resultsList = [...resultsList, ...relatedPosts()];
        break;
      case 'publications':
        resultsList = [...resultsList, ...relatedPublications()];
        break;
      case 'researchers':
        resultsList = [...resultsList, ...relatedUsers()];
        break;
      case 'groups':
        resultsList = [...resultsList, ...relatedGroups()];
        break;
      default:
        resultsList = [];
    }
  }

  return resultsList;
}
