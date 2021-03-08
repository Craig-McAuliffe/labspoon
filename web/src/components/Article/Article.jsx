import Linkify from 'linkifyjs/react';
import React, {useContext} from 'react';
import {Link} from 'react-router-dom';
import {AuthContext} from '../../App';
import {RESEARCHFOCUS, TECHNIQUE} from '../../helpers/resourceTypeDefinitions';
import {ListItemOptionsDropdown} from '../ListItem/ListItemCommonComponents';

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
  authorID,
}) {
  const {userProfile} = useContext(AuthContext);
  const userID = userProfile ? userProfile.id : undefined;
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
    <>
      {userID && userID === authorID && (
        <ListItemOptionsDropdown
          resourceType={resourceType}
          resourceID={resourceID}
        />
      )}
      <div
        className={`article${dedicatedPage ? '' : '-list-item'}-header-section`}
      >
        {resourceID ? (
          <Link to={url}>{sizedHeaders().articleTitle}</Link>
        ) : (
          sizedHeaders().articleTitle
        )}
        <div className="article-list-item-resource-type-svg-container">
          {icon}
        </div>
        {resourceTypeName ? sizedHeaders().articleResourceType : null}
      </div>
    </>
  );
}

export function RichTextBody({body, shouldLinkify}) {
  if (!body) return null;
  const bodyDisplay = (
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
  if (shouldLinkify) return <Linkify>{bodyDisplay}</Linkify>;
  return bodyDisplay;
}

export function getTweetTextFromRichText(text) {
  if (!text) return null;
  return text.reduce((accumulator, current, index) => {
    if (index === 0) return current.children[0].text;
    return accumulator + '%0a' + current.children[0].text;
  }, '');
}
