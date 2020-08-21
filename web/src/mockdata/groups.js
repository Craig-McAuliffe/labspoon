import topics from './topics';
import getTestPosts from './posts';

export default function groups() {
  return [
    {
      name: 'Gilestro Lab',
      id: 'fy792ugirehr9h',
      institution: 'Imperial College London',
      location: 'London',
      Website: 'https://lab.gilest.ro/',
      avatar:
        'https://i.picsum.photos/id/724/1000/1000.jpg?hmac=AjG__UYhipFTMFDl2NTzRv3uA_EM-dPnwHlWxIiS-mQ',
      taggedTopics: [topics()[0], topics()[1]],
      pinnedPost: getTestPosts([])[0],
      about:
        'Thus he said unto him, that the brightness shall come forth from the fruit that bears the sinner, and only he shall be able to set right the woes of the undying.',
    },
    {
      name: 'Neuro Genomics Group',
      id: 'fy780tuhfohff',
      institution: 'Imperial College London',
      location: 'London',
      Website: 'null',
      avatar:
        'https://i.picsum.photos/id/941/1000/1000.jpg?hmac=L--8SZt-e5UBl9D214iij56CLomx8sVGhhwMKBveVOg',
      taggedTopics: [topics()[2], topics()[3]],
      pinnedPost: getTestPosts([])[1],
      about:
        'Under bristling thorns, through which light reveals the shards of blackness that plague the Earth, may sit the unripened soul, that so spuriously decries the sentence that has been passed.',
    },
    {
      name: 'Glycoproteins Group',
      id: 'gsgffe32u8h9g',
      institution: 'Northwestern University',
      Location: 'Evanston',
      Website: 'null',
      avatar:
        'https://i.picsum.photos/id/872/1000/1000.jpg?hmac=8XFELRvUfURgTA5P0ORHCQDp3NXRQVezJkBnCH4lD8U',
      taggedTopics: [topics()[4], topics()[5]],
      pinnedPost: getTestPosts([])[2],
      about:
        'For it is within the shattering of a hope that life may be properly known. Not as a collection of sentience and objectivity, but of causation and subjectivity. Without the crimson fold that befalls the weak, it would not come to pass and oblivion would be upon us all. I am also going to continue writing so that I can test the see more button. Why have we developed such an inefficient agricultural system. Why do we hear sounds and see light and not the other way around.',
    },
  ];
}

export function findSimilarGroups(groupID) {
  return groups().filter((group) => group.id !== groupID);
}
