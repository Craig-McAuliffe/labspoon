import React from 'react';
import './GroupListItem.css';
import {GROUP} from '../../helpers/resourceTypeDefinitions';
import {FollowsPageGroupListItemOptions} from './GroupListItem';
import withSizes from 'react-sizes';

const mapGroupDetailsSizesToProps = ({width}) => ({
  // When the whole site has similar content, we will only switch to this view at 800
  // isMobile: width && width <= 800,
  isMobile: width && width <= 460,
});

function GroupListItemHeadline({
  institution,
  children,
  formattedName,
  isFollowsPageResults,
  isMobile,
  group,
}) {
  return (
    <>
      <div className="group-list-item-name-follow">
        <div className="group-list-item-name-institution-container">
          {formattedName}
          {!isMobile && (
            <h4 className="group-list-item-institution">{institution}</h4>
          )}
        </div>
        <div className="group-list-item-follow-button-container">
          {children}
          {isFollowsPageResults && (
            <div className="group-list-item-follow-options-container">
              <FollowsPageGroupListItemOptions
                resourceType={GROUP}
                targetResourceData={group}
              />
            </div>
          )}
        </div>
      </div>
      {isMobile && (
        <h4 className="group-list-item-institution">{institution}</h4>
      )}
    </>
  );
}

export default withSizes(mapGroupDetailsSizesToProps)(GroupListItemHeadline);
