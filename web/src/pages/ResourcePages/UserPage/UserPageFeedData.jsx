import getFilteredPosts from '../../../mockdata/posts';
import publications, {findCoAuthors} from '../../../mockdata/publications';
import relationships from '../../../mockdata/relationships';

export default function userPageFeedData(skip, limit, filterOptions, userID) {
  const userRelationships = relationships().filter(
    (userRelationships) => userRelationships.user.id === userID
  )[0];

  let resultsList = [];

  const postsByUser = () => {
    const getPostsByUser = getFilteredPosts([])
      .filter((post) => post.author.id === userID)
      .slice(skip, skip + limit);
    resultsList = [...resultsList, ...getPostsByUser];
  };
  const publicationsByUser = () => {
    const getPublicationsByUser = publications()
      .filter(
        (publication) =>
          publication.content.authors.filter((author) =>
            author.id.includes(userID)
          ).length > 0
      )
      .slice(skip, skip + limit);
    resultsList = [...resultsList, ...getPublicationsByUser];
  };
  const userFollowing = () => {
    const getUserFollows = userRelationships.followsUsers.slice(
      skip,
      skip + limit
    );
    resultsList = [...resultsList, ...getUserFollows];
  };
  const userRecommends = () => {
    const getUserRecommends = userRelationships.recommends.slice(
      skip,
      skip + limit
    );
    resultsList = [...resultsList, ...getUserRecommends];
  };
  const userCoAuthors = () => {
    const getUserCoAuthors = findCoAuthors(userID).slice(skip, skip + limit);
    resultsList = [...resultsList, ...getUserCoAuthors];
  };

  const activeTab = filterOptions[0].options.filter(
    (filterOption) => filterOption.enabled === true
  );

  if (activeTab.length > 0) {
    const activeTabID = activeTab[0].data.id;
    switch (activeTabID) {
      case filterOptions[0].options[0].data.id:
        userCoAuthors();
        userRecommends();
        userFollowing();
        publicationsByUser();
        postsByUser();
        break;
      case filterOptions[0].options[1].data.id:
        postsByUser();
        break;
      case filterOptions[0].options[2].data.id:
        publicationsByUser();
        break;
      case filterOptions[0].options[3].data.id:
        userFollowing();
        break;
      case filterOptions[0].options[4].data.id:
        userRecommends();
        break;
      case filterOptions[0].options[5].data.id:
        userCoAuthors();
        break;
      default:
        resultsList = [];
    }
  }
  return resultsList;
}

// const followedByUsers = relationships()
//   .filter(
//     (userRelations) =>
//       userRelations.followsUsers.filter(
//         (followsUser) => followsUser.id === userID
//       ).length > 0
//   )
//   .map((followedByUser) => followedByUser.user);
