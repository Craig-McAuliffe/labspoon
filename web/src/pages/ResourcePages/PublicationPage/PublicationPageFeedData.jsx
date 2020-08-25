import findSimilarPublications from '../../../mockdata/publications';
import findSimilarGroups from '../../../mockdata/groups';
import getFilteredPosts from '../../../mockdata/posts';
import {publicationRelationships} from '../../../mockdata/relationships';
import {getUserRelatedToResource} from '../../../mockdata/users';

export default function publicationPageFeedData(
  skip,
  limit,
  filterOptions,
  publication
) {
  const publicationID = publication.id;
  const publicationTopics = publication.topics;

  let resultsList = [];

  const similarPublications = () =>
    findSimilarPublications(publicationID, publicationTopics).slice(
      skip,
      skip + limit
    );

  const relatedGroups = () =>
    findSimilarGroups(publicationTopics).slice(skip, skip + limit);

  const relatedPosts = () =>
    getFilteredPosts([
      {
        collectionName: 'Topics',
        options: publicationTopics.map((publicationTopic) => ({
          enabled: true,
          data: {
            id: publicationTopic.id,
            name: publicationTopic.name,
          },
        })),
        mutable: false,
      },
    ]).slice(skip, skip + limit);

  const citations = (direction) => {
    const thisPublicationRelationships = publicationRelationships().filter(
      (publication) => publication.publication.id === publicationID
    )[0];

    switch (direction) {
      case 'cites':
        return thisPublicationRelationships.cites.slice(skip, skip + limit);
        break;
      case 'citedBy':
        return thisPublicationRelationships.citedBy.slice(skip, skip + limit);
        break;
      default:
        return;
    }
  };

  const relatedUsers = () =>
    getUserRelatedToResource(publication).slice(skip, skip + limit);

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
        resultsList = [...resultsList, ...similarPublications()];
      case filterOptions[0].options[1].data.id:
        resultsList = [...resultsList, ...relatedPosts()];
        break;
      case filterOptions[0].options[2].data.id:
        resultsList = [...resultsList, ...citations('cites')];
        break;
      case filterOptions[0].options[3].data.id:
        resultsList = [...resultsList, ...citations('citedBy')];
        break;
      case filterOptions[0].options[4].data.id:
        resultsList = [...resultsList, ...relatedUsers()];
        break;
      case filterOptions[0].options[5].data.id:
        resultsList = [...resultsList, ...relatedGroups()];
        break;
      default:
        resultsList = [];
    }
  }
  return resultsList;
}
