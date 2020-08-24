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

  const similarPublications = () => {
    const getSimilarPublications = findSimilarPublications(
      publicationID,
      publicationTopics
    ).slice(skip, skip + limit);
    resultsList = [...resultsList, ...getSimilarPublications];
  };

  const relatedGroups = () => {
    const getSimilarGroups = findSimilarGroups(publicationTopics).slice(
      skip,
      skip + limit
    );
    resultsList = [...resultsList, ...getSimilarGroups];
  };

  const relatedPosts = () => {
    const getRelatedPosts = getFilteredPosts([
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
    resultsList = [...resultsList, ...getRelatedPosts];
  };

  const citations = (direction) => {
    const thisPublicationRelationships = publicationRelationships().filter(
      (publication) => publication.publication.id === publicationID
    )[0];
    let getCitationPublications;
    switch (direction) {
      case 'cites':
        getCitationPublications = thisPublicationRelationships.cites.slice(
          skip,
          skip + limit
        );
        break;
      case 'citedBy':
        getCitationPublications = thisPublicationRelationships.citedBy.slice(
          skip,
          skip + limit
        );
        break;
      default:
        return;
    }
    resultsList = [...resultsList, ...getCitationPublications];
  };

  const relatedUsers = () => {
    const getRelatedUsers = getUserRelatedToResource(publication).slice(
      skip,
      skip + limit
    );

    resultsList = [...resultsList, ...getRelatedUsers];
  };

  const activeTab = filterOptions[0].options.filter(
    (filterOption) => filterOption.enabled === true
  );

  if (activeTab.length > 0) {
    const activeTabID = activeTab[0].data.id;
    switch (activeTabID) {
      case filterOptions[0].options[0].data.id:
        similarPublications();
      case filterOptions[0].options[1].data.id:
        relatedPosts();
        break;
      case filterOptions[0].options[2].data.id:
        citations('cites');
        break;
      case filterOptions[0].options[3].data.id:
        citations('citedBy');
        break;
      case filterOptions[0].options[4].data.id:
        relatedUsers();
        break;
      case filterOptions[0].options[5].data.id:
        relatedGroups();
        break;
      default:
        resultsList = [];
    }
  }
  return resultsList;
}
