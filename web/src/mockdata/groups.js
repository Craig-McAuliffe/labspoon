import topics from './topics';
import getTestPosts from './posts';

export default function groups() {
  return [
    {
      resourceType: 'group',
      name: 'Gilestro Lab',
      id: 'fy792ugirehr9h',
      institution: 'Imperial College London',
      location: 'London',
      Website: 'https://lab.gilest.ro/',
      avatar:
        'https://i.picsum.photos/id/724/1000/1000.jpg?hmac=AjG__UYhipFTMFDl2NTzRv3uA_EM-dPnwHlWxIiS-mQ',
      topics: [topics()[0], topics()[1], topics()[2], topics()[4]],
      pinnedPost: getTestPosts([])[0],
      media: {
        photos: [
          {
            resourceType: 'image',
            src:
              'https://i.picsum.photos/id/227/400/400.jpg?hmac=e-wL4kyvrPEQIn0GNN6KeaVDiAAV29kJxNe9QHkue90',
            alt: 'Blurb about the image',
            id: 'gh389qhtug9ref',
          },
          {
            resourceType: 'image',
            src:
              'https://i.picsum.photos/id/146/400/400.jpg?hmac=xfQnxSRKjuIlGMTO-7iBJoLIdE2poilSwEDrZ03Hovk',
            alt: 'Blurb about the image',
            id: 'tgrheq89gfh',
          },
          {
            resourceType: 'image',
            src:
              'https://i.picsum.photos/id/480/400/400.jpg?hmac=VZSv07n2ipQ8B4gGivB74UOkx0hw7FWPUN1RphmCvbE',
            alt: 'Blurb about the image',
            id: 'tfr3hqfu9eh',
          },
          {
            resourceType: 'image',
            src:
              'https://i.picsum.photos/id/625/400/400.jpg?hmac=gRwxqn6B9CPci-idyZTa6Bi9rARS-8NqQnb9lh05wEA',
            alt: 'Blurb about the image',
            id: 'gr8390qeghuef',
          },
          {
            resourceType: 'image',
            src:
              'https://i.picsum.photos/id/515/400/400.jpg?hmac=ObxAgpXcysaLz2Z0PZFebIrE4osfn6Gq0ukt_bElwOM',
            alt: 'Blurb about the image',
            id: 'tg3reqgfwj8',
          },
        ],
        videos: [],
      },
      about:
        'Thus he said unto him, that the brightness shall come forth from the fruit that bears the sinner, and only he shall be able to set right the woes of the undying.',
    },
    {
      resourceType: 'group',
      name: 'Neuro Genomics Group',
      id: 'fy780tuhfohff',
      institution: 'Imperial College London',
      location: 'London',
      Website: 'null',
      avatar:
        'https://i.picsum.photos/id/941/1000/1000.jpg?hmac=L--8SZt-e5UBl9D214iij56CLomx8sVGhhwMKBveVOg',
      topics: [topics()[2], topics()[3], topics()[0], topics()[4]],
      media: {
        photos: [
          {
            resourceType: 'image',
            src:
              'https://i.picsum.photos/id/252/200/200.jpg?hmac=SQ2Qka9ubeKZdr5jg7hHSzQgeyZcKk_o8H4_OkTw3F4',
            alt: 'Blurb about the image',
            id: 'trh8e9hfda',
          },
          {
            resourceType: 'image',
            src:
              'https://i.picsum.photos/id/901/200/200.jpg?hmac=BofL61KMrHssTtPwqR7iI272BvpjGsjt5PJ_ultE4Z8',
            alt: 'Blurb about the image',
            id: 'gr3qgehr8w9',
          },
          {
            resourceType: 'image',
            src:
              'https://i.picsum.photos/id/266/232/232.jpg?hmac=Be049tMmFJwenNIbuM1gLZ75NJnoaieNkJ8pTdSnPOE',
            alt: 'Blurb about the image',
            id: 'gr3hg3r8e',
          },
          {
            resourceType: 'image',
            src:
              'https://i.picsum.photos/id/736/232/232.jpg?hmac=h0Y8OiGY6h1xUrEHMlxH4Iu8vExEJywBxrMzaZNciQw',
            alt: 'Blurb about the image',
            id: 'fr3hq8grew',
          },
          {
            resourceType: 'image',
            src:
              'https://i.picsum.photos/id/996/232/232.jpg?hmac=dmV6iHkIR7NlFP-pmN4M76XmrPcrcm-68xkRe32Z99I',
            alt: 'Blurb about the image',
            id: 'tg5r3ejhuif',
          },
        ],
        videos: [],
      },
      pinnedPost: getTestPosts([])[1],
      about:
        'Under bristling thorns, through which light reveals the shards of blackness that plague the Earth, may sit the unripened soul, that so spuriously decries the sentence that has been passed.',
    },
    {
      resourceType: 'group',
      name: 'Glycoproteins Group',
      id: 'gsgffe32u8h9g',
      institution: 'Northwestern University',
      Location: 'Evanston',
      Website: 'null',
      avatar:
        'https://i.picsum.photos/id/872/1000/1000.jpg?hmac=8XFELRvUfURgTA5P0ORHCQDp3NXRQVezJkBnCH4lD8U',
      topics: [topics()[4], topics()[5], topics()[3], , topics()[0]],
      media: {
        photos: [
          {
            resourceType: 'image',
            src:
              'https://i.picsum.photos/id/308/400/400.jpg?hmac=1tGcCmGb676fvMkoYwUi8_5QF82S6Q5pUDhTSRGAaiA',
            alt: 'Blurb about the image',
            id: 'y5gr4gehur9w',
          },
          {
            resourceType: 'image',
            src:
              'https://i.picsum.photos/id/100/400/400.jpg?hmac=WKSHIj2ppOCDjmj1Q5ZEqDCLPf2IgyzjG7lVmCU62Yk',
            alt: 'Blurb about the image',
            id: 'gterwjuv9eqjw',
          },
          {
            resourceType: 'image',
            src:
              'https://i.picsum.photos/id/416/400/400.jpg?hmac=Md5nqETTTv4Ea1pH-cqQjj-jUx7hkr9HVrIXVtvTL04',
            alt: 'Blurb about the image',
            id: 'y5greqhgdufi',
          },
          {
            resourceType: 'image',
            src:
              'https://i.picsum.photos/id/228/400/400.jpg?hmac=RYt_tMVPWwec6THlEzF5mmdK8rrf0M1p9XJJXTSAkKM',
            alt: 'Blurb about the image',
            id: 'hygt4qregwfuds',
          },
          {
            resourceType: 'image',
            src:
              'https://i.picsum.photos/id/918/400/400.jpg?hmac=X2r2PLFn6H8LOHvNyMChgfomjGKVeKOwRT-9ZtaTtcs',
            alt: 'Blurb about the image',
            id: '243ejido',
          },
        ],
        videos: [],
      },
      pinnedPost: getTestPosts([])[2],
      about:
        'For it is within the shattering of a hope that life may be properly known. Not as a collection of sentience and objectivity, but of causation and subjectivity. Without the crimson fold that befalls the weak, it would not come to pass and oblivion would be upon us all. I am also going to continue writing so that I can test the see more button. Why have we developed such an inefficient agricultural system. Why do we hear sounds and see light and not the other way around.',
    },
  ];
}

export function findSimilarGroups(topics, groupID) {
  const topTopics = topics.slice(0, 3);

  const matchedGroups = [];

  topTopics.forEach((topic) => {
    groups().forEach((group) => {
      if (groupID && group.id === groupID) return;
      if (
        !matchedGroups.some((matchedGroup) => matchedGroup.id === group.id) &&
        group.topics.some((groupTopic) => groupTopic.id === topic.id)
      ) {
        matchedGroups.push(group);
      }
    });
  });
  return matchedGroups;
}
