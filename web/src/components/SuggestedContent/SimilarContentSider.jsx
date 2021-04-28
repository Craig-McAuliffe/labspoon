import React, {useEffect, useState} from 'react';
import firebase from '../../firebase';
import {Link, useLocation} from 'react-router-dom';
import withSizes from 'react-sizes';
import {MainItemIcon, SimilarContentIcon} from '../../assets/HeaderIcons';
import {PUBLICATION} from '../../helpers/resourceTypeDefinitions';

import './SimilarContentSider.css';
import PublicationListItem from '../Publication/PublicationListItem';

const getSuggestedPublications = firebase
  .functions()
  .httpsCallable('publications-suggestedPublications');

const mapSuggestedSiderSizesToProps = ({width}) => ({
  // When the whole site has similar content, we will only switch to this view at 800
  // isMobile: width && width <= 800,
  isMobile: width && width <= 1197,
});

// Tracks window width and sends boolean prop to
// SimilarContentSider if below 800px
export default withSizes(mapSuggestedSiderSizesToProps)(SimilarContentSider);

function SimilarContentSider({resourceType, resourceID, isMobile, footerOnly}) {
  const [suggestedContent, setSuggestedContent] = useState();
  const [loading, setLoading] = useState(true);
  const pathname = useLocation().pathname;
  useEffect(() => {
    if (!resourceID) return;
    switch (resourceType) {
      case PUBLICATION:
        getSuggestedPublications({
          publicationID: resourceID,
        })
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

  if (isMobile)
    return (
      <MobileRelatedContentFooter
        resourceType={resourceType}
        resourceID={resourceID}
        pathname={pathname}
        loading={loading}
      />
    );
  // This prevents the sider appearing when accessed through fullscreen similar content
  // This will only happen if a user visits the url on a larger screen
  if (footerOnly) return null;
  return (
    <SiderContent
      suggestedContent={suggestedContent}
      resourceType={resourceType}
      loading={loading}
    />
  );
}

function SiderContent({suggestedContent, resourceType, loading}) {
  let similarSiderContent = (
    <GenericSuggestedResourceType
      suggestedContent={suggestedContent}
      resourceType={resourceType}
    />
  );
  if (!suggestedContent || suggestedContent.length === 0)
    similarSiderContent = null;
  if (loading) similarSiderContent = null;
  return (
    <div className="suggested-content-sider-container">
      <h3 className="suggested-content-sider-title">
        Similar {resourceType ? resourceType + 's' : 'content'}
      </h3>
      {similarSiderContent}
    </div>
  );
}

// This is displayed at the bottom of the screen for small devices
// The resource page should route the similar link to the FullScreenSimilarContent component
function MobileRelatedContentFooter({
  resourceID,
  resourceType,
  pathname,
  loading,
}) {
  return (
    <div className="mobile-suggested-content-footer">
      <SimilarContentLinkWrapper
        targetPath={`/${resourceType}/${resourceID}`}
        loading={loading}
      >
        <div
          className={`mobile-footer-button-container${
            loading ? '-loading' : ''
          }`}
        >
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
      </SimilarContentLinkWrapper>
      <SimilarContentLinkWrapper
        targetPath={`/${resourceType}/${resourceID}/similar`}
        loading={loading}
      >
        <div
          className={`mobile-footer-button-container${
            loading ? '-loading' : ''
          }`}
        >
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
      </SimilarContentLinkWrapper>
    </div>
  );
}

function SimilarContentLinkWrapper({loading, targetPath, children}) {
  if (loading) return children;
  return <Link to={targetPath}>{children}</Link>;
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
            {publication.authors.slice(0, 4).map((author) => {
              const authorID = author.id ? author.id : author.microsoftID;
              return (
                <>
                  <p
                    key={authorID}
                    className="suggested-publications-author-name"
                  >
                    {author.name},
                  </p>
                </>
              );
            })}
          </div>
        ) : (
          <></>
        )}
      </div>
    </Link>
  );
}
