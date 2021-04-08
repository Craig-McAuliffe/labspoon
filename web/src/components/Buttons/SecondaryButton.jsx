import React from 'react';

import './SecondaryButton.css';

export default function SecondaryButton({
  onClick,
  inactive,
  width,
  height,
  children,
  light,
  type,
  className,
}) {
  const widthAndHeight = () => {
    if (width && height) return {width: width, height: height};
    if (width) return {width: width};
    if (height) return {height: height};
    return null;
  };

  let buttonClass = 'secondary-button';
  if (inactive) buttonClass = buttonClass + '-disabled';
  if (light) buttonClass = buttonClass + '-light';
  if (className) buttonClass = `${buttonClass} ${className}`;

  return (
    <button
      className={buttonClass}
      style={widthAndHeight()}
      onClick={onClick}
      type={type ? type : 'button'}
    >
      <h3 className="secondary-button-text">{children}</h3>
    </button>
  );
}
