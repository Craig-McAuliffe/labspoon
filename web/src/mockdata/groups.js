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
    },
  ];
}

export function findSimilarGroups(groupID) {
  return groups().filter((group) => group.id !== groupID);
}
