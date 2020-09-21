import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import CustomToggle from '../../../CustomToggle';
import {ExpandIcon} from '../../../../assets/PostActionIcons';

import './CreatePost.css';

export default function PostTypeDropDown({postType, setPostType}) {
  const postTypeOptions = ['Default', 'Publication', 'Open Position'];
  return (
    <Dropdown>
      <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
        <ExpandIcon />
        <div className="create-post-dropdown-toggle-name">Type:{postType}</div>
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {postTypeOptions.map((postTypeOption) => (
          <div key={postTypeOption} className="post-type-dropdown-option">
            <button onClick={() => setPostType(postTypeOption)}>
              {postTypeOption}
            </button>
          </div>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
