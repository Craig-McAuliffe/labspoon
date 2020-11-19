import React, {useEffect, useState} from 'react';
import firebase from '../../firebase';
import {Link} from 'react-router-dom';

import './SuggestedContentSider.css';

const PUBLICATION_TYPE = 'publication';

const getSuggestedPublications = firebase
  .functions()
  .httpsCallable('publications-suggestedPublications');

export default function SuggestedContentSider({resourceType, resourceID}) {
  const [suggestedContent, setSuggestedContent] = useState();

  useEffect(() => {
    if (!resourceID) return;
    switch (resourceType) {
      case PUBLICATION_TYPE:
        getSuggestedPublications(resourceID).then((resp) =>
          setSuggestedContent(resp.data)
        );
    }
  }, [resourceType, resourceID]);

  const genericSuggestedResourceType = () => {
    switch (resourceType) {
      case PUBLICATION_TYPE:
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
        {publication.authors ? (
          <div className="suggested-publication-authors-container">
            {publication.authors.slice(0, 4).map((author) => (
              <>
                <p
                  key={author.id}
                  className="suggested-publications-author-name"
                >
                  {author.name},
                </p>
              </>
            ))}
          </div>
        ) : (
          <></>
        )}
      </div>
    </Link>
  );
}
