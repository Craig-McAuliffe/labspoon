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
} from '../../../components/Images/ImageListItem';
import {TechniqueIcon} from '../../../assets/ResourceTypeIcons';
import {TECHNIQUE} from '../../../helpers/resourceTypeDefinitions';
import NotFoundPage from '../../NotFoundPage/NotFoundPage';

export default function TechniquePage() {
  const [technique, setTechnique] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const techniqueID = useParams().techniqueID;
  const history = useHistory();

  useEffect(() => {
    setLoading(true);
    if (!techniqueID) {
      setNotFound(true);
      return;
    }
    db.doc(`techniques/${techniqueID}`)
      .get()
      .then((ds) => {
        if (!ds.exists) {
          setNotFound(true);
        }
        const techniqueFromDB = ds.data();
        techniqueFromDB.resourceType = TECHNIQUE;
        setTechnique(techniqueFromDB);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        console.error('Unable to retrieve technique:', err);
        setError(true);
      });
  }, [techniqueID, history]);

  if (error) return <GeneralError />;
  if (notFound) return <NotFoundPage />;
  if (loading) return <LoadingSpinnerPage />;
  return (
    <PaddedPageContainer>
      <ArticleHeaderAndType
        title={technique.title}
        resourceType={technique.resourceType}
        icon={<TechniqueIcon />}
        dedicatedPage={true}
      />
      <ListItemTopics
        dbTopics={technique.topics}
        customTopics={technique.customTopics}
      />
      <GroupListItem group={technique.group} noBorder={true}>
        <FollowGroupButton targetGroup={technique.group} />
      </GroupListItem>
      <ImagesSection
        images={formatTaggedImages(technique.photoURLs)}
        customMargin="30px"
      />
      <RichTextBody body={technique.body} />
      <Author authorID={technique.author.id} name={technique.author.name} />
    </PaddedPageContainer>
  );
}
