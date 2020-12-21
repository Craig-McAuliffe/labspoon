import React from 'react';
import {useLocation, Link} from 'react-router-dom';

import './LightTabLink.css';

export default function LightTabLink({name, link}) {
  const location = useLocation();
  return (
    <Link
      to={link}
      className={
        location.pathname === link ? 'light-tab-active' : 'light-tab-inactive'
      }
    >
      <h2>{name}</h2>
    </Link>
  );
}
