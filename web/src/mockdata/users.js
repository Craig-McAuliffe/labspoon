import getTestPosts from './posts';

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
        'https://i.picsum.photos/id/135/1070/400.jpg?hmac=KRCavEj7l8SO0fXGfut2mpvxaFDgDAi55yLMTnk8_X4',
    },
    {
      resourceType: 'user',
      name: 'Craig McAuliffe',
      id: 'QlnBFXHK0SDe5o7B85DMYehiO7H',
      avatar:
        'https://i.picsum.photos/id/620/200/200.jpg?hmac=i-QlnBFXHK0SDe5o7B85DMYehiO7H-fZxsKLRrfFCcU',
      memberOfGroup: 'Neuro Genomics Group',

      coverPhoto:
        'https://i.picsum.photos/id/318/1070/400.jpg?hmac=998uFvn3FgVNw5KAlPBCOHYMKkEm_XTsvGFlPypKj-s',
    },
    {
      resourceType: 'user',
      name: 'Labspoon',
      id: 'GHJ4IS43R2FHU53252IFD',
      avatar: 'https://i.ibb.co/4VbMRyv/Group-183-1.png',
      coverPhoto:
        'https://i.picsum.photos/id/831/1070/400.jpg?hmac=hd-Gn40aBm7P2nl9MswimwpvakW8kScpTQdRGO9qpzM',
    },
    {
      resourceType: 'user',
      name: 'Sally McDee',
      id: 'gg7s98yr2u8hf',
      avatar: 'https://picsum.photos/200/200',
      memberOfGroup: 'Gilestro Lab',
      coverPhoto:
        'https://i.picsum.photos/id/603/1070/400.jpg?hmac=VelnIm28H0n5XrQjZSOPJlslQyDEvRLDZbEm5MV3Tn0',
    },
    {
      resourceType: 'user',
      name: 'Joshua McLee',
      id: 'fyd7s89gr2uifur',
      avatar: 'https://picsum.photos/200/200',
      memberOfGroup: 'Glycoproteins Group',
      coverPhoto:
        'https://i.picsum.photos/id/573/1070/400.jpg?hmac=Rz2Rqu_BXtzMLvXqv9xQ0SX3jTNpfTT9xpZBwXb4uE0',
    },
    {
      resourceType: 'user',
      name: 'Xi McSee',
      id: 'fdhsuifd78gyfe',
      avatar: 'https://picsum.photos/200/200',
      memberOfGroup: 'Neuro Genomics Group',
      coverPhoto:
        'https://i.picsum.photos/id/690/1070/400.jpg?hmac=SSpqFbTXPNTc63HE_KdnVulVXs_C20P2Urxb4xH5d2M',
    },
    {
      resourceType: 'user',
      name: 'Flee McWee',
      id: 'hdus97ruhfjkdfds',
      avatar: 'https://picsum.photos/200/200',
      memberOfGroup: 'Gilestro Lab',
      coverPhoto:
        'https://i.picsum.photos/id/1049/1070/400.jpg?hmac=piHzRgZA1_8x9fu5Xwa0QNFYnEZtosX-iyHU41-v65k',
    },
    {
      resourceType: 'user',
      name: 'Cecelia McThee',
      id: '38ugifbjkdsnse52IFD',
      avatar: 'https://picsum.photos/200/200',
      memberOfGroup: 'Glycoproteins Group',
      coverPhoto:
        'https://i.picsum.photos/id/563/1070/400.jpg?hmac=m-UK_Fpt1l2sh898oosIO_bDT9CdkigxZf2zduxvQNI',
    },
    {
      resourceType: 'user',
      name: 'Charly McVee',
      id: 'u89hduihr32hfh',
      avatar: 'https://picsum.photos/200/200',
      memberOfGroup: 'Glycoproteins Group',
      coverPhoto:
        'https://i.picsum.photos/id/690/1070/400.jpg?hmac=SSpqFbTXPNTc63HE_KdnVulVXs_C20P2Urxb4xH5d2M',
    },
  ];
}

// The posts that we use to retrieve topics related to user should be limited to an amount
// by date created.
export function getSimilarUsers(userID) {
  const postsList = getTestPosts([]);

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
    return matchedAuthors;
  };
  return similarAuthors();
}
