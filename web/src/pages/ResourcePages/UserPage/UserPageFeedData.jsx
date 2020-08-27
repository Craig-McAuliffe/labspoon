import getFilteredPosts from '../../../mockdata/posts';
import publications, {findCoAuthors} from '../../../mockdata/publications';
import relationships from '../../../mockdata/relationships';

export default function userPageFeedData(skip, limit, filterOptions, userID) {
  if (!userID) return [];
  const userRelationships = relationships().filter(
    (userRelationships) => userRelationships.user.id === userID
  )[0];

  let resultsList = [];

  const postsByUser = () =>
    getFilteredPosts([])
      .filter((post) => post.author.id === userID)
      .slice(skip, skip + limit);
  const publicationsByUser = () =>
    publications()
      .filter(
        (publication) =>
          publication.content.authors.filter((author) =>
            author.id.includes(userID)
          ).length > 0
      )
      .slice(skip, skip + limit);
  const userFollowing = () =>
    userRelationships.followsUsers.slice(skip, skip + limit);

  const userRecommends = () =>
    userRelationships.recommends.slice(skip, skip + limit);

  const userCoAuthors = () => findCoAuthors(userID).slice(skip, skip + limit);

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
      case filterOptions[0].options[0].data.id:
        resultsList = [
          ...resultsList,
          ...userCoAuthors(),
          ...userRecommends(),
          ...userFollowing(),
          ...publicationsByUser(),
          ...postsByUser(),
        ];
        break;
      case filterOptions[0].options[1].data.id:
        resultsList = [...resultsList, ...postsByUser()];
        break;
      case filterOptions[0].options[2].data.id:
        resultsList = [...resultsList, ...publicationsByUser()];
        break;
      case filterOptions[0].options[3].data.id:
        resultsList = [...resultsList, ...userFollowing()];
        break;
      case filterOptions[0].options[4].data.id:
        resultsList = [...resultsList, ...userRecommends()];
        break;
      case filterOptions[0].options[5].data.id:
        resultsList = [...resultsList, ...userCoAuthors()];
        break;
      default:
        resultsList = [];
    }
  }
  return resultsList;
}
