import React from 'react';
import {useLocation, Link} from 'react-router-dom';

import './LightTab.css';

export default function LightTabLink({name, link, active}) {
  const location = useLocation();
  let activeTab;
  if (active) activeTab = true;
  if (location.pathname.includes(link)) activeTab = true;
  return (
    <Link
      to={link}
      className={activeTab ? 'light-tab-active' : 'light-tab-inactive'}
    >
      <h2>{name}</h2>
    </Link>
  );
}

export function LightTabContainer({children}) {
  return <div className="light-tabs-container">{children}</div>;
}
