import React from 'react';

import './SecondaryButton.css';

export default function SecondaryButton({
  onClick,
  inactive,
  width,
  height,
  children,
  light,
}) {
  const widthAndHeight = () => {
    if (width && height) return {width: width, height: height};
    if (width) return {width: width};
    if (height) return {height: height};
    return null;
  };

  let className = 'secondary-button';
  if (inactive) className = className + '-disabled';
  if (light) className = className + '-light';

  return (
    <button className={className} style={widthAndHeight()} onClick={onClick}>
      <h3 className="secondary-button-text">{children}</h3>
    </button>
  );
}
