import React from 'react';

import {Link} from 'react-router-dom';

import {
  FunderIcon,
  SalaryIcon,
  LocationIcon,
  MethodsIcon,
  CalendarIcon,
  ResearcherIcon,
} from '../../../../assets/PostOptionalTagsIcons';

import './PostOptionalTags.css';

const PostOptionalTags = ({optionalTags}) => {
  if (optionalTags.length == 0 || !optionalTags) return null;
  {
    const optionalTagItems = optionalTags.map((optionalTag) => {
      if (optionalTag.type == 'researcher') {
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
      break;
    case 'methods':
      return <MethodsIcon />;
      break;
    case 'start date':
      return <CalendarIcon />;
      break;
    case 'salary':
      return <SalaryIcon />;
      break;
    case 'funder':
      return <FunderIcon />;
      break;
    case 'amount':
      return <SalaryIcon />;
      break;
    case 'researcher':
      return <ResearcherIcon />;
      break;
    default:
      return <div></div>;
  }
};

export default PostOptionalTags;
