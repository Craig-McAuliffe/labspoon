import React from 'react';

import './HeaderIcons.css';

export const NoUserIcon = () => (
  <svg
    width="24"
    height="30"
    viewBox="0 0 24 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.847 1C14.7755 1 17.1657 3.38684 17.1657 6.31287C17.1657 9.24009 14.7743 11.6316 11.847 11.6316C8.92101 11.6316 6.53418 9.2413 6.53418 6.31287C6.53418 3.38564 8.91981 1 11.847 1Z"
      stroke="#00507C"
      strokeWidth="2"
    />
    <path
      d="M1 29V25.9838C1 20.0306 5.84558 15.209 11.8446 15.209C17.8437 15.209 22.6893 20.0306 22.6893 25.9838V29H1Z"
      stroke="#00507C"
      strokeWidth="2"
    />
  </svg>
);

export const SearchIconGrey = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8C16 9.84871 15.3729 11.551 14.3199 12.9056L19.7071 18.2929L18.2929 19.7071L12.9056 14.3199C11.551 15.3729 9.84871 16 8 16ZM14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z"
      fill="#DCDCE0"
    />
  </svg>
);
// hoverControl means that the component using CreateButton is controlling its style
// when CreateButton is used within buttons it cannot have an independent hover state
export function CreateIcon({hoverControl}) {
  return (
    <svg
      width="50"
      height="50"
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="create-icon-svg"
    >
      <circle
        className={`create-button-circle${hoverControl ? '-controlled' : ''}`}
        cx="25"
        cy="25"
        r="25"
      />
      <path
        d="M25.5185 11V24.4815M25.5185 39V24.4815M25.5185 24.4815H39M25.5185 24.4815H11"
        stroke="#00507C"
        strokeWidth="4"
      />
    </svg>
  );
}

export function FiltersIcon() {
  return (
    <svg
      width="22"
      height="19"
      viewBox="0 0 22 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.35445 0C5.08356 0 4.0033 0.85785 3.65381 2.03342H0.762533C0.317722 2.03342 0 2.38292 0 2.82773C0 3.27254 0.349495 3.62203 0.794306 3.62203H3.68558C4.0033 4.79761 5.11533 5.65546 6.38622 5.65546C7.68888 5.65546 8.76914 4.79761 9.11863 3.62203H20.8426C21.2874 3.62203 21.6369 3.27254 21.6369 2.82773C21.6369 2.38292 21.2874 2.03342 20.8426 2.03342H9.11863C8.73736 0.85785 7.65711 0 6.35445 0ZM6.38622 1.58861C7.05343 1.58861 7.62533 2.12874 7.62533 2.82773C7.62533 3.52672 7.05343 4.06685 6.38622 4.06685C5.719 4.06685 5.1471 3.52672 5.1471 2.82773C5.1471 2.12874 5.719 1.58861 6.38622 1.58861Z"
        fill="#00507C"
      />
      <path
        d="M15.9179 6.35437C14.647 6.35437 13.5667 7.21222 13.2172 8.38779H0.794306C0.317722 8.38779 0 8.73729 0 9.1821C0 9.62691 0.349495 9.97641 0.794306 9.97641H13.2172C13.535 11.152 14.647 12.0098 15.9179 12.0098C17.2205 12.0098 18.3008 11.152 18.6503 9.97641H20.8426C21.2874 9.97641 21.6369 9.62691 21.6369 9.1821C21.6369 8.73729 21.2874 8.38779 20.8426 8.38779H18.6503C18.3008 7.21222 17.2205 6.35437 15.9179 6.35437ZM15.9497 7.94298C16.6169 7.94298 17.1888 8.48311 17.1888 9.1821C17.1888 9.88109 16.6169 10.4212 15.9497 10.4212C15.2824 10.4212 14.7105 9.88109 14.7105 9.1821C14.7105 8.48311 15.2507 7.94298 15.9497 7.94298Z"
        fill="#00507C"
      />
      <path
        d="M10.1671 13.3446C8.89622 13.3446 7.81597 14.2025 7.46647 15.378H0.794306C0.317722 15.378 0 15.7275 0 16.1723C0 16.6171 0.349495 16.9666 0.794306 16.9666H7.49825C7.81597 18.1422 8.928 19.0001 10.1989 19.0001C11.5015 19.0001 12.5818 18.1422 12.9313 16.9666H20.8426C21.2874 16.9666 21.6369 16.6171 21.6369 16.1723C21.6369 15.7275 21.2874 15.378 20.8426 15.378H12.8995C12.55 14.2025 11.4698 13.3446 10.1671 13.3446ZM10.1989 14.9332C10.8661 14.9332 11.438 15.4733 11.438 16.1723C11.438 16.8713 10.8661 17.4115 10.1989 17.4115C9.53167 17.4115 8.95977 16.8713 8.95977 16.1723C8.99154 15.4733 9.53167 14.9332 10.1989 14.9332Z"
        fill="#00507C"
      />
    </svg>
  );
}
