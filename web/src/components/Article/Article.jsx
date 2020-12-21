import React from 'react';
import {Link} from 'react-router-dom';
import {RESEARCHFOCUS, TECHNIQUE} from '../../helpers/resourceTypeDefinitions';

import './Article.css';

export function Author({authorID, name}) {
  return (
    <div className="author-container">
      <p className="field-label">Created By</p>
      <Link to={`/user/${authorID}`}>{name}</Link>
    </div>
  );
}

export function ArticleHeaderAndType({
  title,
  resourceType,
  icon,
  resourceID,
  dedicatedPage,
}) {
  let url;
  let resourceTypeName;
  switch (resourceType) {
    case RESEARCHFOCUS:
      url = `/researchFocus/${resourceID}`;
      resourceTypeName = 'Research Focus';
      break;
    case TECHNIQUE:
      url = `/technique/${resourceID}`;
      resourceTypeName = 'Technique';
      break;
    default:
      url = '/notfound';
      resourceTypeName = undefined;
  }

  const sizedHeaders = () => {
    let articleTitle;
    let articleResourceType;
    if (dedicatedPage) {
      articleTitle = <h2>{title}</h2>;
      articleResourceType = <h3>{resourceTypeName}</h3>;
    } else {
      articleTitle = <h3>{title}</h3>;
      articleResourceType = <h4>{resourceTypeName}</h4>;
    }
    return {
      articleTitle: articleTitle,
      articleResourceType: articleResourceType,
    };
  };

  return (
    <div
      className={`article${dedicatedPage ? '' : '-list-item'}-header-section`}
    >
      {resourceID ? (
        <Link to={url}>{sizedHeaders().articleTitle}</Link>
      ) : (
        sizedHeaders().articleTitle
      )}
      {icon}
      {resourceTypeName ? sizedHeaders().articleResourceType : null}
    </div>
  );
}

export function RichTextBody({body}) {
  if (!body) return null;
  return (
    <div className="rich-body-section">
      {body.map((bodySection, i) =>
        bodySection.type === 'paragraph' ? (
          <p key={bodySection.type + i}>{bodySection.children[0].text}</p>
        ) : (
          <h3 key={bodySection.type + i}>{bodySection.children[0].text}</h3>
        )
      )}
    </div>
  );
}
