import React from 'react';

const CustomToggle = React.forwardRef(({children, onClick}, ref) => (
  <a
    href=""
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
  >
    {children}
  </a>
));

CustomToggle.displayName = CustomToggle;

export default CustomToggle;
