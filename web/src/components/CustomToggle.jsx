import React from 'react';

const CustomToggle = React.forwardRef(({children, onClick}, ref) => (
  <button
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
  >
    {children}
  </button>
));

CustomToggle.displayName = CustomToggle;

export default CustomToggle;
