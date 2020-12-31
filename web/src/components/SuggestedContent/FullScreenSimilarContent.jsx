import React, {useEffect, useState} from 'react';
import firebase from '../../firebase';

import {PaddedPageContainer, UnpaddedPageContainer} from '../Layout/Content';
import SimilarContentSider, {
  GenericSuggestedResourceType,
} from './SimilarContentSider';
import {PUBLICATION} from '../../helpers/resourceTypeDefinitions';
import {LoadingSpinnerPage} from '../LoadingSpinner/LoadingSpinner';

import './SimilarContentSider.css';

const getSuggestedPublications = firebase
  .functions()
  .httpsCallable('publications-suggestedPublications');

// This is displayed on mobile devices if similar is selected
// The SimilarContentSider moves to the bottom here
export default function FullScreenSimilarContent({resourceType, resourceID}) {
  const [suggestedContent, setSuggestedContent] = useState();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!resourceID) return;
    switch (resourceType) {
      case PUBLICATION:
        getSuggestedPublications(resourceID).then((resp) => {
          setLoading(false);
          setSuggestedContent(resp.data);
        });
        break;
      default:
        setSuggestedContent([]);
    }
  }, [resourceType, resourceID]);

  if (loading)
    return (
      <>
        <LoadingSpinnerPage />
        <SimilarContentSider
          resourceType={resourceType}
          resourceID={resourceID}
          footerOnly={true}
        />
      </>
    );
  if (!suggestedContent || suggestedContent.length === 0)
    return (
      <NoSimilarContent resourceType={resourceType} resourceID={resourceID} />
    );

  return (
    <>
      <UnpaddedPageContainer>
        <GenericSuggestedResourceType
          suggestedContent={suggestedContent}
          resourceType={resourceType}
          fullScreen={true}
        />
      </UnpaddedPageContainer>
      <SimilarContentSider
        resourceType={resourceType}
        resourceID={resourceID}
        footerOnly={true}
      />
    </>
  );
}

function NoSimilarContent({resourceType, resourceID}) {
  return (
    <>
      <PaddedPageContainer>
        <h4>We are unable to find any similar content.</h4>
      </PaddedPageContainer>
      <SimilarContentSider
        resourceType={resourceType}
        resourceID={resourceID}
        footerOnly={true}
      />
    </>
  );
}
