import React from 'react';
import UserAvatar from '../Avatar/UserAvatar';
import SwitchButtonState from '../Utility/SwitchButtonState';
import './ResearcherListing.css';

const ResearcherListing = ({id}) => (
  <div className="Container">
    <div className="Avatar">
      <UserAvatar src="https://picsum.photos/200" />
    </div>
    <div className="Name">
      <h2>
        Researcher Name based on id:<b>{id}</b> goes here
      </h2>
    </div>
    <div className="Follow">
      <SwitchButtonState type="follow" />
    </div>
  </div>
);
export default ResearcherListing;
