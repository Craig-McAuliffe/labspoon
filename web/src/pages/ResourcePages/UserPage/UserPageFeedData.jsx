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

  const userGroups = () =>
    relationships().filter(
      (userRelationships) => userRelationships.user.id === userID
    )[0].memberOfGroups;

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
    console.log(activeTabID);
    switch (activeTabID) {
      case 'overview':
        resultsList = [
          ...resultsList,
          ...userCoAuthors(),
          ...publicationsByUser(),
          ...postsByUser(),
        ];
        break;
      case 'posts':
        resultsList = [...resultsList, ...postsByUser()];
        break;
      case 'publications':
        resultsList = [...resultsList, ...publicationsByUser()];
        break;
      case 'follows':
        resultsList = [...resultsList, ...userFollowing()];
        break;
      case 'recommends':
        resultsList = [...resultsList, ...userRecommends()];
        break;
      case 'coauthors':
        resultsList = [...resultsList, ...userCoAuthors()];
        break;
      case 'groups':
        resultsList = [...resultsList, ...userGroups()];
        break;
      default:
        resultsList = [];
    }
  }
  return resultsList;
}
