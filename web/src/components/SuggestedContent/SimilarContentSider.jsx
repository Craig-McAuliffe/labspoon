import React, {useEffect, useState} from 'react';
import firebase from '../../firebase';
import {Link, useLocation} from 'react-router-dom';
import withSizes from 'react-sizes';
import {MainItemIcon, SimilarContentIcon} from '../../assets/HeaderIcons';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import {PUBLICATION} from '../../helpers/resourceTypeDefinitions';

import './SimilarContentSider.css';
import PublicationListItem from '../Publication/PublicationListItem';

const getSuggestedPublications = firebase
  .functions()
  .httpsCallable('publications-suggestedPublications');

function SimilarContentSider({resourceType, resourceID, isMobile, footerOnly}) {
  const [suggestedContent, setSuggestedContent] = useState();
  const [loading, setLoading] = useState(true);
  const pathname = useLocation().pathname;

  useEffect(() => {
    if (!resourceID) return;
    switch (resourceType) {
      case PUBLICATION:
        getSuggestedPublications(resourceID)
          .then((resp) => {
            setLoading(false);
            setSuggestedContent(resp.data);
          })
          .catch((err) => {
            console.error(err);
            setSuggestedContent([]);
          });
        break;
      default:
        setSuggestedContent([]);
    }
  }, [resourceType, resourceID]);

  if (!suggestedContent || suggestedContent.length === 0) return null;
  if (isMobile)
    return (
      <MobileRelatedContentFooter
        resourceType={resourceType}
        resourceID={resourceID}
        pathname={pathname}
      />
    );
  // This prevents the sider appearing when accessed through fullscreen similar content
  // This will only happen if a user visits the url on a larger screen
  if (footerOnly) return null;
  return (
    <SiderContent
      suggestedContent={suggestedContent}
      resourceType={resourceType}
      resourceID={resourceID}
      loading={loading}
    />
  );
}

const mapSuggestedSiderSizesToProps = ({width}) => ({
  // When the whole site has similar content, we will only switch to this view at 800
  // isMobile: width && width <= 800,
  isMobile: width && width <= 1197,
});

// Tracks window width and sends boolean prop to
// SimilarContentSider if below 800px
export default withSizes(mapSuggestedSiderSizesToProps)(SimilarContentSider);

function SiderContent({suggestedContent, resourceID, resourceType, loading}) {
  return (
    <div className="suggested-content-sider-container">
      <h3 className="suggested-content-sider-title">
        Similar {resourceType ? resourceType + 's' : 'content'}
      </h3>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <GenericSuggestedResourceType
          suggestedContent={suggestedContent}
          resourceType={suggestedContent}
        />
      )}
    </div>
  );
}

// This is displayed at the bottom of the screen for small devices
// The resource page should route the similar link to the FullScreenSimilarContent component
function MobileRelatedContentFooter({resourceID, resourceType, pathname}) {
  return (
    <div className="mobile-suggested-content-footer">
      <Link to={`/${resourceType}/${resourceID}`}>
        <div className="mobile-footer-button-container">
          <MainItemIcon />
          <h3
            className={
              pathname.includes('similar')
                ? ''
                : 'mobile-footer-button-text-active'
            }
          >
            Item
          </h3>
        </div>
      </Link>
      <Link to={`/${resourceType}/${resourceID}/similar`}>
        <div className="mobile-footer-button-container">
          <SimilarContentIcon />
          <h3
            className={
              pathname.includes('similar')
                ? 'mobile-footer-button-text-active'
                : ''
            }
          >
            Similar
          </h3>
        </div>
      </Link>
    </div>
  );
}

export const GenericSuggestedResourceType = ({
  suggestedContent,
  resourceType,
  fullScreen,
}) => {
  switch (resourceType) {
    case PUBLICATION:
      return suggestedContent.map((suggestedPublication) =>
        fullScreen ? (
          <PublicationListItem
            key={suggestedPublication.id}
            publication={suggestedPublication}
          />
        ) : (
          <SuggestedPublicationListItem
            key={suggestedPublication.id}
            publication={suggestedPublication}
          />
        )
      );
    default:
      return null;
  }
};

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
