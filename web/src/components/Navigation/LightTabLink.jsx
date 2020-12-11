import React from 'react';
import {useLocation, Link} from 'react-router-dom';

import './LightTabLink.css';

export default function LightTabLink({name, link}) {
  const location = useLocation();
  return (
    <Link to={link}>
      <button type="button">
        <h2
          className={
            location.pathname === link
              ? 'light-tab-active'
              : 'light-tab-inactive'
          }
        >
          {name}
        </h2>
      </button>
    </Link>
  );
}
