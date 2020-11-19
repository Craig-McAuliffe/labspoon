import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {db} from '../../firebase';
import {getPaginatedPublicationsFromCollectionRef} from '../../helpers/publications';

import './SuggestedContentSider.css';

const PUBLICATIONTYPE = 'publication';

export default function SuggestedContentSider({resourceType, resourceID}) {
  const [suggestedContent, setSuggestedContent] = useState();

  useEffect(() => {
    fetchSuggestedContent(resourceType, setSuggestedContent);
  }, [resourceID]);

  const genericSuggestedResourceType = () => {
    switch (resourceType) {
      case PUBLICATIONTYPE:
        return suggestedContent.map((suggestedPublication) => (
          <SuggestedPublicationListItem
            key={suggestedPublication.id}
            publication={suggestedPublication}
          />
        ));
      default:
        return null;
    }
  };
  if (!suggestedContent || suggestedContent.length === 0) return null;
  return (
    <div className="suggested-content-sider-container">
      <h3 className="suggested-content-sider-title">
        Similar {resourceType ? resourceType + 's' : 'content'}
      </h3>
      {genericSuggestedResourceType()}
    </div>
  );
}

export function SuggestedPublicationListItem({publication}) {
  if (!publication) return null;
  return (
    <Link
      to={`/publication/${publication.id}`}
      className="suggested-publication-link-container"
    >
      <div className="suggested-publication-container">
        <p className="suggested-publication-title">{publication.title}</p>
        <div className="suggested-publication-authors-container">
          {publication.authors.slice(0, 4).map((author) => (
            <>
              <p key={author.id} className="suggested-publications-author-name">
                {author.name},
              </p>
            </>
          ))}
        </div>
      </div>
    </Link>
  );
}

function fetchSuggestedContent(resourceType, setSuggestedContent) {
  switch (resourceType) {
    case PUBLICATIONTYPE:
      getPaginatedPublicationsFromCollectionRef(
        db.collection('publications'),
        11
      )
        .then((fetchedMockSuggestedPublications) => {
          if (fetchedMockSuggestedPublications)
            setSuggestedContent(fetchedMockSuggestedPublications.slice(1, 11));
          else return;
        })
        .catch((err) =>
          console.error('unable to get mock publication data', err)
        );
      break;
    default:
      return;
  }
}
