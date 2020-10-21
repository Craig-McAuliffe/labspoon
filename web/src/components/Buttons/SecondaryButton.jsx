import React from 'react';

import './Buttons.css';
export default function SecondaryButton({
  onClick,
  inactive,
  width,
  height,
  children,
}) {
  const widthAndHeight = () => {
    if (width && height) return {width: width, height: height};
    if (width) return {width: width};
    if (height) return {height: height};
    return null;
  };
  return (
    <button
      className={
        inactive ? 'secondary-button-inactive' : 'secondary-button-active'
      }
      style={widthAndHeight()}
      onClick={onClick}
    >
      <h3>{children}</h3>
    </button>
  );
}
