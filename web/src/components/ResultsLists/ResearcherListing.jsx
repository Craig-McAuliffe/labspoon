import React from 'react';
import UserAvatar from '../Avatar/UserAvatar';
import SwitchButtonState from '../Utility/SwitchButtonState';
import './ResearcherListing.css';

const ResearcherListing = ({id}) => (
  <div className="Container">
    <div className="Avatar">
      <UserAvatar src="https://picsum.photos/200" width="70px" />
    </div>
    <div className="AvatarSmall">
      <UserAvatar src="https://picsum.photos/200" width="60px" />
    </div>
    <div className="Name">
      <h2>
        Researcher Name based on id:<b>{id}</b> goes here
      </h2>
      <h4>
        Researcher Name based on id:<b>{id}</b> goes here
      </h4>
    </div>
    <div className="Follow">
      <SwitchButtonState type="follow" />
    </div>
  </div>
);
export const ResearcherTag = ({id}) => (
  <div className="tag-container">
    <div className="Avatar">
      <UserAvatar src="https://picsum.photos/200" width="70px" />
    </div>
    <div className="AvatarSmall">
      <UserAvatar src="https://picsum.photos/200" width="60px" />
    </div>
    <div className="Name">
      <h2>
        Researcher Name based on id:<b>{id}</b> goes here
      </h2>
      <h4>
        Researcher Name based on id:<b>{id}</b> goes here
      </h4>
    </div>
    <div className="Follow">
      <SwitchButtonState type="follow" />
    </div>
  </div>
);
export default ResearcherListing;
