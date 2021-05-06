import React from 'react';

export const BookmarkIconUnselected = () => (
  <svg
    width="16"
    height="20"
    viewBox="0 0 16 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8.17184 15.7475L7.77792 15.5787L7.384 15.7475L1.00013 18.4835L1.00001 1.00041L14.5557 1.00003V18.4835L8.17184 15.7475Z"
      stroke="#00507C"
      strokeWidth="2"
    />
  </svg>
);
export const RecommendIconUnselected = () => (
  <svg
    width="14"
    height="23"
    viewBox="0 0 14 23"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0.885902 8.98916L0.885917 8.98912L0.880311 8.98676C0.574399 8.85773 0.5 8.67223 0.5 8.57288V0.5H13.5V8.57288C13.5 8.68288 13.4248 8.85984 13.1282 8.9891L13.1281 8.98916L7.3717 11.5H7.13533L7.19977 11.4719L8.59977 10.8617L8.9 10.7309V10.4034V1.01695V0.516949H8.4H5.6H5.1V1.01695V10.4034V10.7309L5.40023 10.8617L6.80023 11.4719L6.86467 11.5H6.6423L0.885902 8.98916Z"
      stroke="#00507C"
    />
    <path
      d="M7.26813 20.2222L7 20.0518L6.73187 20.2222L4.04086 21.9319L4.76416 18.6682L4.82679 18.3856L4.6129 18.1905L2.17725 15.9695L5.35848 15.6854L5.66345 15.6582L5.77782 15.3741L7 12.3387L8.22219 15.3741L8.33655 15.6582L8.64152 15.6854L11.8227 15.9695L9.3871 18.1905L9.17321 18.3856L9.23585 18.6682L9.95915 21.9319L7.26813 20.2222Z"
      stroke="#00507C"
    />
  </svg>
);
export const ToGroupIconUnselected = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="3.5" cy="3.5" r="2.5" stroke="#00507C" strokeWidth="2" />
    <circle cx="12.5" cy="7.5" r="2.5" stroke="#00507C" strokeWidth="2" />
    <circle cx="3.5" cy="12.5" r="2.5" stroke="#00507C" strokeWidth="2" />
  </svg>
);

export const ToGroupIconSelected = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="3.5" cy="3.5" r="3.5" fill="#3099d3" />
    <circle cx="12.5" cy="7.5" r="3.5" fill="#3099d3" />
    <circle cx="3.5" cy="12.5" r="3.5" fill="#3099d3" />
  </svg>
);

export const ShareIconUnselected = () => (
  <svg
    width="18"
    height="16"
    viewBox="0 2 18 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16.833 7.99458L10.7327 14.697V11.2194V10.7194H10.2327H9.79479C6.27754 10.7194 2.91891 12.1658 0.5 14.7126V13.4723C0.5 8.94117 4.1657 5.26971 8.68564 5.26971H10.2327H10.7327V4.76971V1.29216L16.833 7.99458Z"
      stroke="#00507C"
    />
  </svg>
);
export const ShareIconSelected = () => (
  <svg
    width="18"
    height="16"
    viewBox="0 2 18 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17.5091 7.99458L10.2327 0V4.76971H8.68564C3.88863 4.76971 0 8.66595 0 13.4723V16L0.687157 15.2455C3.02341 12.6808 6.32908 11.2194 9.79479 11.2194H10.2327V15.9892L17.5091 7.99458Z"
      fill="#3099d3"
    />
  </svg>
);

export const ExpandIcon = () => (
  <svg
    width="24"
    height="13"
    viewBox="0 0 24 13"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M1 1L12 11L23 1" stroke="#5D5D65" strokeWidth="2" />
  </svg>
);

export const HideIcon = () => (
  <svg
    width="24"
    height="13"
    viewBox="0 0 24 13"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M1 12L12 2L23 12" stroke="#5D5D65" strokeWidth="2" />
  </svg>
);

export function GroupBookmarkIcon() {
  return (
    <svg
      width="16"
      height="17"
      viewBox="0 0 16 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.44957 9.91419L5.05565 9.74537L4.66173 9.91419L1.00008 11.4835L1.00001 1.00026L9.11121 1.00003V11.4835L5.44957 9.91419Z"
        fill="#F5F6F6"
        stroke="#00507C"
        strokeWidth="2"
      />
      <path
        d="M10.4496 13.9142L10.0556 13.7454L9.66173 13.9142L6.00008 15.4835L6.00001 5.00026L14.1112 5.00003V15.4835L10.4496 13.9142Z"
        fill="#F5F6F6"
        stroke="#00507C"
        strokeWidth="2"
      />
    </svg>
  );
}

export function CommentIcon() {
  return (
    <svg
      width="24"
      height="20"
      viewBox="0 0 24 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 14.6552H13.1726L6.96552 19H2L4.4829 14.6552H3.24152C2.00014 14.6552 2.00014 14.6552 2.00014 13.4138C2.00014 12.1724 2.00025 3.48276 2.00013 2.24138C2 1 2 1 3.24138 1H19.9999C21.2412 1 21.2412 1 21.2412 2.24138L21.2414 13.4138C21.2414 14.6552 21.2414 14.6552 20 14.6552Z"
        fill="white"
        stroke="#00507C"
        strokeWidth="2"
      />
    </svg>
  );
}
