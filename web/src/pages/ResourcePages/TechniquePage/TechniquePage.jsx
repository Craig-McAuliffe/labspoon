import React, {useState, useEffect} from 'react';
import {useParams, useHistory} from 'react-router-dom';
import {db} from '../../../firebase';
import GeneralError from '../../../components/GeneralError';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import {FeedContent} from '../../../components/Layout/Content';
import ListItemTopics from '../../../components/CommonListItemParts/ListItemTopics';
import {ImagePreviews} from '../../../components/Images/ImageUpload';
import GroupListItem from '../../../components/Group/GroupListItem';
import FollowGroupButton from '../../../components/Group/FollowGroupButton';
import {Author, Paragraph, Title} from '../../../components/Article/Article';

export default function TechniquePage() {
  const [technique, setTechnique] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const techniqueID = useParams().techniqueID;
  const history = useHistory();

  useEffect(() => {
    setLoading(true);
    db.doc(`techniques/${techniqueID}`)
      .get()
      .then((ds) => {
        if (!ds.exists) {
          history.push('/notfound');
        }
        setTechnique(ds.data());
      })
      .catch((err) => {
        console.error('Unable to retrieve technique:', err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [techniqueID]);

  if (error) return <GeneralError />;

  if (loading) return <LoadingSpinner />;

  return (
    <FeedContent>
      <Title>{technique.title}</Title>
      {technique.topics.length > 0 ? (
        <>
          <ListItemTopics
            dbTopics={technique.topics}
            customTopics={technique.customTopics}
          />
        </>
      ) : null}
      <GroupListItem group={technique.group} noBorder={true}>
        <FollowGroupButton targetGroup={technique.group} />
      </GroupListItem>
      {technique.body.map((p, i) => (
        <Paragraph key={i}>{p.children[0].text}</Paragraph>
      ))}
      <ImagePreviews urls={technique.photoURLs} />
      <Author authorID={technique.author.id} name={technique.author.name} />
    </FeedContent>
  );
}
