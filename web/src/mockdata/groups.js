export default function groups() {
  return [
    {
      name: 'Gilestro Lab',
      id: 'fy792ugirehr9h',
      institution: 'Imperial College London',
      location: 'London',
      Website: 'https://lab.gilest.ro/',
      avatar:
        'https://i.picsum.photos/id/966/400/400.jpg?hmac=vTfdl7XUAXbnfiOQraT_4rOs-cUPhso7ZM6TihvkFhk',
    },
    {
      name: 'Neuro Genomics Group',
      id: 'fy780tuhfohff',
      institution: 'Imperial College London',
      location: 'London',
      Website: 'null',
      avatar:
        'https://i.picsum.photos/id/806/400/400.jpg?hmac=VeG2sErI6YRzsbOA4DRntIdRi0UWSuEwv-mhVl-5fH4',
    },
    {
      name: 'Glycoproteins Group',
      id: 'gsgffe32u8h9g',
      institution: 'Northwestern University',
      Location: 'Evanston',
      Website: 'null',
      avatar:
        'https://i.picsum.photos/id/74/400/400.jpg?hmac=bDtryDbES_9o6a51PQtx9RcTIxxrPQm-_c7yZjHkL2Q',
    },
  ];
}

export function findSimilarGroups(groupID) {
  return groups().filter((group) => group.id !== groupID);
}
