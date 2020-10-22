import React from 'react';

import {Link} from 'react-router-dom';

import {
  FunderIcon,
  SalaryIcon,
  LocationIcon,
  MethodsIcon,
  CalendarIcon,
  ResearcherIcon,
  URLIcon,
} from '../../../../assets/PostOptionalTagsIcons';
import PublicationListItem from '../../../Publication/PublicationListItem';

import './PostOptionalTags.css';

const PostOptionalTags = ({optionalTags}) => {
  if (!optionalTags || optionalTags.length === 0) return null;
  {
    const optionalTagItems = optionalTags.map((optionalTag) => {
      if (optionalTag.type === 'researcher') {
        return (
          <div key={optionalTag.type} className="optional-tag-researcher">
            <OptionalTagIcon
              type={optionalTag.type}
              className="optional-tag-icon"
            />
            <div className="optional-tag-researcher-container">
              {optionalTag.content.map((researcher) => (
                <Link
                  to={`/profile/${researcher.id}`}
                  key={researcher.id}
                  className="optional-tag-researcher-name"
                >
                  {researcher.name}
                </Link>
              ))}
            </div>
          </div>
        );
      }
      if (optionalTag.type === 'publication') {
        return (
          <div className="post-optional-tag-publication" key={optionalTag.type}>
            <PublicationListItem publication={optionalTag.content} />
          </div>
        );
      }
      return (
        <div key={optionalTag.type} className="optional-tag">
          <OptionalTagIcon
            type={optionalTag.type}
            className="optional-tag-icon"
          />
          <p className="optional-tag-name">{optionalTag.type}</p>
          <p className="optional-tag-content">{optionalTag.content}</p>
        </div>
      );
    });
    return <div className="optional-tag-container">{optionalTagItems}</div>;
  }
};

const OptionalTagIcon = ({type}) => {
  switch (type) {
    case 'location':
      return <LocationIcon />;
    case 'methods':
      return <MethodsIcon />;
    case 'startDate':
      return <CalendarIcon />;
    case 'salary':
      return <SalaryIcon />;
    case 'funder':
      return <FunderIcon />;
    case 'amount':
      return <SalaryIcon />;
    case 'URL':
      return <URLIcon />;
    case 'publicationURL':
      return <URLIcon />;
    case 'researcher':
      return <ResearcherIcon />;
    case 'position':
      return <ResearcherIcon />;
    default:
      return <div></div>;
  }
};

export default PostOptionalTags;
