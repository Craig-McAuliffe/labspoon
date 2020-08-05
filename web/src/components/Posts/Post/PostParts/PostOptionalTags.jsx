import React from 'react';

import {
  FunderIcon,
  SalaryIcon,
  LocationIcon,
  MethodsIcon,
  CalendarIcon,
} from '../../../../assets/PostOptionalTagsIcons';

import {ResearcherTag} from '../../../ResultsLists/ResearcherListing';

import './PostOptionalTags.css';
const PostOptionalTags = ({optionalTags}) => {
  if (optionalTags.length > 0) {
    const optionalTagItems = optionalTags.map((optionalTag) => {
      if (optionalTag.type == 'researcher')
        return <ResearcherTag id={optionalTag.content.researcher.id} />;
      else
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
  } else return null;
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
      return <ResearcherTag />;
      break;
    default:
      return <div></div>;
  }
};

export default PostOptionalTags;
