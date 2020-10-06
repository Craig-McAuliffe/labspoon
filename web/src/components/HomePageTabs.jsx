import React from 'react';
import {Link, useLocation} from 'react-router-dom';
import {NewsIcon, FollowingFeedIcon} from '../assets/TabsIcons';

import './HomePageTabs.css';

export default function HomePageTabs() {
  const location = useLocation();
  return (
    <div className="home-page-tabs-container">
      <div className="home-page-following-tab-container">
        <Link to="/">
          <div
            className={
              location.pathname === '/news'
                ? 'home-page-tab-inactive'
                : 'home-page-tab-active'
            }
          >
            <FollowingFeedIcon />
            <h2>Following</h2>
          </div>
        </Link>
      </div>
      <div className="home-page-news-tab-container">
        <Link to="/news">
          <div
            className={
              location.pathname === '/news'
                ? 'home-page-tab-active'
                : 'home-page-tab-inactive'
            }
          >
            <NewsIcon />
            <h2>News</h2>
          </div>
        </Link>
      </div>
    </div>
  );
}
