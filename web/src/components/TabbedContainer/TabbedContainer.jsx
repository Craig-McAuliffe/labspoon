import React, {useState} from 'react';

import './TabbedContainer.css';

export default function TabbedContainer({tabDetails}) {
  const [active, setActive] = useState(0);
  const tabs = tabDetails.map((details, i) => (
    <Tab
      name={details.name}
      setActive={() => setActive(i)}
      active={active === i}
      icon={details.icon}
      key={i}
    />
  ));
  return (
    <div className="tabbed-container-section">
      <TabGroup>{tabs}</TabGroup>
      <Container>{tabDetails[active].contents}</Container>
    </div>
  );
}

function Container({children}) {
  return <div className="tabbed-container-container">{children}</div>;
}

function TabGroup({children}) {
  return <div>{children}</div>;
}

function Tab({name, icon, active, setActive}) {
  return (
    <button
      onClick={setActive}
      className={'tabbed-container-button' + (active ? ' active' : '')}
      type="button"
    >
      {icon}
      <h3 className="tabbed-container-text">{name}</h3>
    </button>
  );
}
