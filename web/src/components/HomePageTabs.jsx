import React from 'react';
import {Link, useLocation} from 'react-router-dom';
import {FrontierIcon, FollowingFeedIcon} from '../assets/TabsIcons';

import './HomePageTabs.css';

export default function HomePageTabs() {
  const location = useLocation();
  return (
    <div className="home-page-tabs-container">
      <div className="home-page-following-tab-container">
        <Link to="/">
          <div
            className={
              location.pathname === '/frontier'
                ? 'home-page-tab-inactive'
                : 'home-page-tab-active'
            }
          >
            <FollowingFeedIcon />
            <h2>Following</h2>
          </div>
        </Link>
      </div>
      <div className="home-page-frontier-tab-container">
        <Link to="/frontier">
          <div
            className={
              location.pathname === '/frontier'
                ? 'home-page-tab-active'
                : 'home-page-tab-inactive'
            }
          >
            <FrontierIcon />
            <h2>Frontier</h2>
          </div>
        </Link>
      </div>
    </div>
  );
}
