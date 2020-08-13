import topics from './topics';
import users from './users';

export default function publications(uniqueID) {
  return [
    {
      id: '0b7sya8',
      title:
        'SARS-CoV-2 neutralization and serology testing of COVID-19 convalescent plasma from donors with non-severe disease',
      url: 'https://www.nature.com/articles/s41467-020-17708-1',
      content: {
        abstract:
          'Aging is an inevitable course of life. Additionally, the risk of chronic diseases or cancer increases with age. The comprehensive identification of signs related to aging can be beneficial for the prevention and early diagnosis of geriatric diseases. The comparison of global modifications in the urine proteome is a means of multidimensional information mining. This approach is based on urine, in which changes from whole-body metabolism can accumulate. This study used the urine of healthy people at different ages (22 children, 10 young people, 6 senior people) as the research object and using high-resolution tandem mass spectrometry, label-free quantitation combined with non-limiting modification identification algorithms and random group test, compared the differences in protein chemical modifications among three groups. The results show that multi-sites oxidative modifications and amino acid substitutions are noticeable features that distinguish these three age groups of people. The proportion of multi-site oxidations in urine proteins of senior (29.76%) is significantly higher than the young group (13.71% and 12.97%), which affect the biological processes of various proteins. This study could provide a reference for studies of aging mechanisms and biomarkers of age-related disease.',
        authors: [
          users()[3],
          users()[4],
          users()[5],
          users()[6],
          users()[7],
          users()[8],
        ],
      },
      topics: [topics()[5]],
      optionaltags: [],
    },
    {
      id: '890dsj57f',
      title: 'This is a non COVID publication.',
      url: 'https://www.nature.com/articles/s41467-020-17708-1',
      content: {
        abstract:
          'Aging is an inevitable course of life. Additionally, the risk of chronic diseases or cancer increases with age. The comprehensive identification of signs related to aging can be beneficial for the prevention and early diagnosis of geriatric diseases. The comparison of global modifications in the urine proteome is a means of multidimensional information mining. This approach is based on urine, in which changes from whole-body metabolism can accumulate. This study used the urine of healthy people at different ages (22 children, 10 young people, 6 senior people) as the research object and using high-resolution tandem mass spectrometry, label-free quantitation combined with non-limiting modification identification algorithms and random group test, compared the differences in protein chemical modifications among three groups. The results show that multi-sites oxidative modifications and amino acid substitutions are noticeable features that distinguish these three age groups of people. The proportion of multi-site oxidations in urine proteins of senior (29.76%) is significantly higher than the young group (13.71% and 12.97%), which affect the biological processes of various proteins. This study could provide a reference for studies of aging mechanisms and biomarkers of age-related disease.',
        authors: [
          users()[3],
          users()[4],
          users()[5],
          users()[6],
          users()[7],
          users()[8],
        ],
      },
      topics: [topics()[3], topics()[4]],
      optionaltags: [],
    },
    {
      id: '34ufihsd8',
      title: 'SARS CoV-2 RNA vaccine phase-2 clinical trial results',
      url: 'https://www.nature.com/articles/s41467-020-17708-1',
      content: {
        abstract:
          'Aging is an inevitable course of life. Additionally, the risk of chronic diseases or cancer increases with age. The comprehensive identification of signs related to aging can be beneficial for the prevention and early diagnosis of geriatric diseases. The comparison of global modifications in the urine proteome is a means of multidimensional information mining. This approach is based on urine, in which changes from whole-body metabolism can accumulate. This study used the urine of healthy people at different ages (22 children, 10 young people, 6 senior people) as the research object and using high-resolution tandem mass spectrometry, label-free quantitation combined with non-limiting modification identification algorithms and random group test, compared the differences in protein chemical modifications among three groups. The results show that multi-sites oxidative modifications and amino acid substitutions are noticeable features that distinguish these three age groups of people. The proportion of multi-site oxidations in urine proteins of senior (29.76%) is significantly higher than the young group (13.71% and 12.97%), which affect the biological processes of various proteins. This study could provide a reference for studies of aging mechanisms and biomarkers of age-related disease.',
        authors: [
          users()[3],
          users()[4],
          users()[5],
          users()[6],
          users()[7],
          users()[8],
        ],
      },
      topics: [topics()[5]],
      optionaltags: [],
    },
    {
      id: '48df92rh297f',
      title:
        'SARS CoV-2 innate T Cell overreaction and chronic inflammation as explanation for male and age-related vulnerability.',
      url: 'https://www.nature.com/articles/s41467-020-17708-1',
      content: {
        abstract:
          'Aging is an inevitable course of life. Additionally, the risk of chronic diseases or cancer increases with age. The comprehensive identification of signs related to aging can be beneficial for the prevention and early diagnosis of geriatric diseases. The comparison of global modifications in the urine proteome is a means of multidimensional information mining. This approach is based on urine, in which changes from whole-body metabolism can accumulate. This study used the urine of healthy people at different ages (22 children, 10 young people, 6 senior people) as the research object and using high-resolution tandem mass spectrometry, label-free quantitation combined with non-limiting modification identification algorithms and random group test, compared the differences in protein chemical modifications among three groups. The results show that multi-sites oxidative modifications and amino acid substitutions are noticeable features that distinguish these three age groups of people. The proportion of multi-site oxidations in urine proteins of senior (29.76%) is significantly higher than the young group (13.71% and 12.97%), which affect the biological processes of various proteins. This study could provide a reference for studies of aging mechanisms and biomarkers of age-related disease.',
        authors: [
          users()[3],
          users()[4],
          users()[5],
          users()[6],
          users()[7],
          users()[8],
        ],
      },
      topics: [topics()[5]],
      optionaltags: [],
    },
  ];
}

export const findSimilarPublications = (topicIDs, thisPublicationID) => {
  const uniquePublications = [];
  topicIDs.map((topicID) => {
    publications().map((publication) => {
      if (publication.id !== thisPublicationID)
        publication.topics.map((topic) => {
          if (
            topic.id === topicID &&
            uniquePublications.map(
              (uniquePublication) => uniquePublication != topicID
            )
          )
            uniquePublications.push(publication);
        });
    });
  });
  return uniquePublications.slice(0, 5);
};
