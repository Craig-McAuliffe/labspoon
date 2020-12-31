import React, {useState, useEffect} from 'react';
import {useParams, useHistory} from 'react-router-dom';
import {db} from '../../../firebase';
import GeneralError from '../../../components/GeneralError';
import {LoadingSpinnerPage} from '../../../components/LoadingSpinner/LoadingSpinner';
import {PaddedPageContainer} from '../../../components/Layout/Content';
import ListItemTopics from '../../../components/ListItem/ListItemTopics';
import GroupListItem from '../../../components/Group/GroupListItem';
import FollowGroupButton from '../../../components/Group/FollowGroupButton';
import {
  Author,
  RichTextBody,
  ArticleHeaderAndType,
} from '../../../components/Article/Article';
import {
  formatTaggedImages,
  ImagesSection,
} from '../../../components/Media/ImageListItem';
import {ResearchFocusIcon} from '../../../assets/ResourceTypeIcons';
import {RESEARCHFOCUS} from '../../../helpers/resourceTypeDefinitions';

export default function ResearchFocusPage() {
  const [researchFocus, setResearchFocus] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const researchFocusID = useParams().researchFocusID;
  const history = useHistory();

  useEffect(() => {
    setLoading(true);
    db.doc(`researchFocuses/${researchFocusID}`)
      .get()
      .then((ds) => {
        if (!ds.exists) {
          history.push('/notfound');
        }
        const researchFocusFromDB = ds.data();
        researchFocusFromDB.resourceType = RESEARCHFOCUS;
        setResearchFocus(researchFocusFromDB);
      })
      .catch((err) => {
        console.error('Unable to retrieve technique:', err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [researchFocusID, history]);

  if (error) return <GeneralError />;

  if (loading) return <LoadingSpinnerPage />;

  return (
    <PaddedPageContainer>
      <ArticleHeaderAndType
        title={researchFocus.title}
        resourceType={researchFocus.resourceType}
        icon={<ResearchFocusIcon />}
        dedicatedPage={true}
      />
      <ListItemTopics
        dbTopics={researchFocus.topics}
        customTopics={researchFocus.customTopics}
      />
      <GroupListItem group={researchFocus.group} noBorder={true}>
        <FollowGroupButton targetGroup={researchFocus.group} />
      </GroupListItem>
      <ImagesSection
        images={formatTaggedImages(researchFocus.photoURLs)}
        customMargin="30px"
      />
      <RichTextBody body={researchFocus.body} />
      <Author
        authorID={researchFocus.author.id}
        name={researchFocus.author.name}
      />
    </PaddedPageContainer>
  );
}
