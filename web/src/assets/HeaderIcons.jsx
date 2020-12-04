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

export function CreateButton() {
  return (
    <svg
      width="50"
      height="50"
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle className="create-button-circle" cx="25" cy="25" r="25" />
      <path
        d="M25.5185 11V24.4815M25.5185 39V24.4815M25.5185 24.4815H39M25.5185 24.4815H11"
        stroke="#00507C"
        strokeWidth="4"
      />
    </svg>
  );
}
