import publications from '../../../mockdata/publications';
import getFilteredPosts from '../../../mockdata/posts';
import groups from '../../../mockdata/groups';
import relationships from '../../../mockdata/relationships';

export default function GroupPageFeedData(
  skip,
  limit,
  filterOptions,
  currentGroup
) {
  let resultsList = [];

  if (currentGroup === undefined) {
    return resultsList;
  }

  const groupMembers = () =>
    relationships()
      .filter((userRelationships) =>
        userRelationships.memberOfGroups.some(
          (groupConnectedToUser) =>
            groupConnectedToUser.name === currentGroup.name
        )
      )
      .map((userRelationships) => userRelationships.user)
      .slice(skip, skip + limit);

  const groupPosts = () => {
    return getFilteredPosts([
      {
        collectionName: 'People',
        options: groupMembers().map((member) => ({
          enabled: true,
          data: {
            id: member.id,
            name: member.name,
          },
        })),
        mutable: false,
      },
    ]).slice(skip, skip + limit);
  };

  let activeTab;
  if (filterOptions.length === 0) {
    activeTab = [];
  } else {
    activeTab = filterOptions[0].options.filter(
      (filterOption) => filterOption.enabled === true
    );
  }

  const groupMedia = () => {
    return groups()
      .filter((group) => group.id === currentGroup.id)[0]
      .media.photos.slice(skip, skip + limit);
  };

  const groupPublications = () => {
    const uniquePublicationsByMembers = [];
    groupMembers().forEach((member) => {
      publications().forEach((publication) => {
        if (
          !uniquePublicationsByMembers.some(
            (uniquePublication) => uniquePublication.id === publication.id
          ) &&
          publication.content.authors.some((author) => author.id === member.id)
        ) {
          uniquePublicationsByMembers.push(publication);
        }
      });
    });
    return uniquePublicationsByMembers.slice(skip, skip + limit);
  };

  if (activeTab.length > 0) {
    const activeTabID = activeTab[0].data.id;
    switch (activeTabID) {
      case filterOptions[0].options[0].data.id:
        resultsList = [
          ...resultsList,
          ...groupPosts(),
          ...groupMedia(),
          ...groupPublications(),
          ...groupMembers(),
        ];
        break;
      case filterOptions[0].options[1].data.id:
        resultsList = [...resultsList, ...groupPosts()];
        break;
      case filterOptions[0].options[2].data.id:
        resultsList = [...resultsList, ...groupMedia()];
        break;
      case filterOptions[0].options[3].data.id:
        resultsList = [...resultsList, ...groupPublications()];
        break;
      case filterOptions[0].options[4].data.id:
        resultsList = [...resultsList, ...groupMembers()];
        break;
      default:
        resultsList = [];
    }
  }
  return resultsList;
}
