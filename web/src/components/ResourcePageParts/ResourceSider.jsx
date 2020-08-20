import React from 'react';
/**
 * Receives .
 * @param {Array} siderTitleChoice - An array of possible sider titles
 * @return {React.ReactElement}
 */
export default function ResourceSider({titleChoice, children}) {
  // From memory
  const search = false;

  const siderTitleSwitch = () => (search ? titleChoice()[0] : titleChoice()[1]);

  return (
    <div className="resource-sider">
      <h3 className="resource-sider-title">{siderTitleSwitch()}</h3>
      <div className="suggested-resources-container">{children}</div>
    </div>
  );
}
