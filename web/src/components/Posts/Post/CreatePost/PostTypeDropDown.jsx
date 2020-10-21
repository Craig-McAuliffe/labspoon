import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import CustomToggle from '../../../CustomToggle';
import {ExpandIcon} from '../../../../assets/PostActionIcons';

import './CreatePost.css';

export default function PostTypeDropDown({postType, setPostType}) {
  const postTypeOptions = ['Default', 'Publication', 'Open Position'];
  return (
    <div className="create-post-post-type-dropdown-container">
      <Dropdown>
        <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
          <div className="create-post-dropdown-toggle-name">
            <h4>
              Post Type: <span>{postType}</span>
            </h4>
          </div>
          <ExpandIcon />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {postTypeOptions.map((postTypeOption) => (
            <Dropdown.Item key={postTypeOption}>
              <div className="post-type-dropdown-option">
                <button onClick={() => setPostType(postTypeOption)}>
                  {postTypeOption}
                </button>
              </div>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}
