import React, {useState} from 'react';
import {useParams} from 'react-router-dom';
import FullScreenSimilarContent from '../../../components/SuggestedContent/FullScreenSimilarContent';

export default function SimilarPublicationsPage() {
  const [publicationID, setPublicationID] = useState(undefined);
  const publicationIDParam = useParams().publicationID;
  if (publicationID !== publicationIDParam) {
    setPublicationID(publicationIDParam);
  }
  return (
    <>
      <FullScreenSimilarContent
        resourceType={'publication'}
        resourceID={publicationID}
      />
    </>
  );
}
