import getFilteredPosts from './posts';
import publications, {findCoAuthors} from './publications';

export default function users() {
  return [
    {
      resourceType: 'user',
      name: 'Patrick Leask',
      id: '283h8wef8shef',
      avatar:
        'https://i.picsum.photos/id/804/200/200.jpg?hmac=73qw3Bnt67aOsdWd033BvfX9Gq0gIJ6FSL3Dp3gA97E',
      memberOfGroup: 'Gilestro Lab',
      coverPhoto:
        'https://i.picsum.photos/id/508/1070/200.jpg?hmac=zuoVvRij5oaspEYUA-r6XWUDuHQXigbUHUfhCaCIuqc',
      institution: 'University College London',
    },
    {
      resourceType: 'user',
      name: 'Craig McAuliffe',
      id: 'QlnBFXHK0SDe5o7B85DMYehiO7H',
      avatar:
        'https://i.picsum.photos/id/620/200/200.jpg?hmac=i-QlnBFXHK0SDe5o7B85DMYehiO7H-fZxsKLRrfFCcU',
      memberOfGroup: 'Neuro Genomics Group',

      coverPhoto:
        'https://i.picsum.photos/id/638/1070/200.jpg?hmac=IgJ8dCBUGLoANdgkRMzDCfWKbbrys26pcX69SKhB950',
      institution: 'Imperial College London',
    },
    {
      resourceType: 'user',
      name: 'Labspoon',
      id: 'GHJ4IS43R2FHU53252IFD',
      avatar: 'https://i.ibb.co/4VbMRyv/Group-183-1.png',
      memberOfGroup: '',
      coverPhoto:
        'https://i.picsum.photos/id/911/1070/200.jpg?hmac=VZ6jy5-zkbVgmSnlLZhEchqoFa0uKs9u4XBbKszPgRc',
      institution: '',
    },
    {
      resourceType: 'user',
      name: 'Sally McDee',
      id: 'g9ht9hu9',
      avatar:
        'https://i.picsum.photos/id/436/200/200.jpg?hmac=axiGy-zt6-TD5Hu1AD_rhudOgkfr-VQElZPKE592Mwc',
      memberOfGroup: 'Gilestro Lab',
      coverPhoto:
        'https://i.picsum.photos/id/469/1070/200.jpg?hmac=Wtc81sjzGxetS6HSfbavhMJrl5xQscA9_ZQuCnnSKp0',
      institution: 'University of Bristol',
    },
    {
      resourceType: 'user',
      name: 'Joshua McLee',
      id: 'fyd7s89gr2uifur',
      avatar:
        'https://i.picsum.photos/id/384/200/200.jpg?hmac=TAsUnIQnfLj13hjjp8604_rXNHrqCGlB2K8UQoWt1aM',
      memberOfGroup: 'Glycoproteins Group',
      coverPhoto:
        'https://i.picsum.photos/id/167/1070/200.jpg?hmac=N44jHe15qiF1GP4SSVFUYgn7JDeS_N6poyHRJI-0PA0',
      institution: 'Oxford University',
    },
    {
      resourceType: 'user',
      name: 'Xi McSee',
      id: 'fdhsuifd78gyfe',
      avatar:
        'https://i.picsum.photos/id/28/200/200.jpg?hmac=eT-kjSvX_wh2uU3SYgAuRWjzo4ndNGimCCiNEaWlnOg',
      memberOfGroup: 'Neuro Genomics Group',
      coverPhoto:
        'https://i.picsum.photos/id/678/1070/200.jpg?hmac=nFJE4lfjvpRGF4zTNdM4KyEERYXROazuFr-SjPSmppM',
      institution: 'Oxford University',
    },
    {
      resourceType: 'user',
      name: 'Flee McWee',
      id: 'hdus97ruhfjkdfds',
      avatar:
        'https://i.picsum.photos/id/807/200/200.jpg?hmac=Y8gayvNItiQYxP_Pd-2un9GH09XuyJdIZOQPw6K9QsI',
      memberOfGroup: 'Gilestro Lab',
      coverPhoto:
        'https://i.picsum.photos/id/742/1070/200.jpg?hmac=Ub6pN-k_ZGWgKyfhYE9JFxsoRMlMw8WdohoxV2iGu9E',
      institution: 'Oxford University',
    },
    {
      resourceType: 'user',
      name: 'Cecelia McThee',
      id: '38ugifbjkdsnse52IFD',
      avatar:
        'https://i.picsum.photos/id/404/200/200.jpg?hmac=7TesL9jR4uM2T_rW-vLbBjqvfeR37MJKTYA4TV-giwo',
      memberOfGroup: 'Glycoproteins Group',
      coverPhoto:
        'https://i.picsum.photos/id/277/1070/200.jpg?hmac=5Q7cdTNBgOxi_s2rf6bejfAOjD0eYSRROlXQNn80hIs',
      institution: 'Oxford University',
    },
    {
      resourceType: 'user',
      name: 'Charly McVee',
      id: 'u89hduihr32hfh',
      avatar:
        'https://i.picsum.photos/id/628/200/200.jpg?hmac=iI5Sx7kEQEboYw_QKjCo-GsB_EyIcdl7LYnW-EbgEqg',
      memberOfGroup: 'Glycoproteins Group',
      coverPhoto:
        'https://i.picsum.photos/id/591/1070/200.jpg?hmac=6wwNGQVsvvCTVbLvbsF9u-HSjyW9r_x6LGW-rhIyt_Y',
      institution: 'Oxford University',
    },
  ];
}

// The posts that we use to retrieve topics related to user should be limited to an amount
// by date created.
export function getSimilarUsers(userID) {
  const postsList = getFilteredPosts([]);

  const getMostCommonTopics = () => {
    const taggedTopicIDs = [];
    const taggedTopicsCounting = [];

    postsList
      .filter((post) => post.author.id === userID)
      .forEach((postByUser) =>
        postByUser.topics.forEach((topic) => taggedTopicIDs.push(topic.id))
      );

    for (const topicID of taggedTopicIDs) {
      let countedIndex;
      let alreadyCounted = false;
      for (let i = 0; i < taggedTopicsCounting.length; i++) {
        countedIndex = i;
        if (taggedTopicsCounting[i].id === topicID) {
          alreadyCounted = true;
          break;
        }
      }
      alreadyCounted
        ? (taggedTopicsCounting[countedIndex].count += 1)
        : taggedTopicsCounting.push({id: topicID, count: 1});
    }
    const taggedTopicsOrdered = taggedTopicsCounting.sort((a, b) => {
      if (a.count - b.count > 0) return -1;
      if (a.count - b.count < 0) return 1;
      return 0;
    });

    return taggedTopicsOrdered;
  };

  const similarAuthors = () => {
    const matchedAuthors = [];
    const refinedCommonTopics = getMostCommonTopics().slice(0, 3);

    let matchingPost;
    for (let i = 0; i < 4; i++) {
      if (matchedAuthors.length < 10 && refinedCommonTopics[i]) {
        for (let n = 0; n < postsList.length; n++) {
          if (matchedAuthors.length < 10) {
            matchingPost = postsList[n];
            let isMatched = false;
            matchingPost.topics.forEach((topic) => {
              if (topic.id === refinedCommonTopics[i].id) isMatched = true;
            });
            if (
              isMatched &&
              matchingPost.author.id !== userID &&
              matchedAuthors.filter(
                (matchedAuthor) => matchedAuthor.id === matchingPost.author.id
              ).length === 0
            ) {
              matchedAuthors.push(matchingPost.author);
            }
          }
        }
      }
    }
    if (matchedAuthors.length > 6) return matchedAuthors;
    const commonCoAuthors = findCoAuthors(userID);
    return [...matchedAuthors, ...commonCoAuthors].slice(0, 5);
  };
  return similarAuthors();
}

export function getUserRelatedToResource(resource) {
  const matchingPublications = () => {
    const matchedPublications = [];

    resource.topics.forEach((resourceTopic) => {
      publications().forEach((publication) => {
        if (
          matchedPublications.some(
            (matchedPublication) => matchedPublication === publication
          )
        )
          return;
        if (publication.topics.some((topic) => topic.id === resourceTopic.id)) {
          matchedPublications.push(publication);
        }
      });
    });
    return matchedPublications;
  };

  const similarUsers = [];

  matchingPublications().forEach((matchedPublication) => {
    matchedPublication.content.authors.forEach((author) => {
      if (similarUsers.some((similarUser) => similarUser.id === author.id))
        return;
      similarUsers.push(author);
    });
  });

  return similarUsers;
}
