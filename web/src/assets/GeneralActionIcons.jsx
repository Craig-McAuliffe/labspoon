import React from 'react';

import './Icons.css';
export function WriteIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="16.2656"
        y="0.00390625"
        width="6.18627"
        height="4.84143"
        transform="rotate(45 16.2656 0.00390625)"
        fill="#00507C"
      />
      <rect
        x="12.4688"
        y="3.80469"
        width="6.18627"
        height="13.4484"
        transform="rotate(45 12.4688 3.80469)"
        fill="#00507C"
      />
      <path
        d="M2.18718 18.4489L7.32229 17.6881L2.94793 13.3138L2.18718 18.4489Z"
        fill="#3099D3"
      />
    </svg>
  );
}

export function EditIcon({light}) {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 -2 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="16.2656"
        y="0.00390625"
        width="6.18627"
        height="4.84143"
        transform="rotate(45 16.2656 0.00390625)"
        fill={light ? '#ffffff' : '#00507C'}
      />
      <rect
        x="12.4688"
        y="3.80469"
        width="6.18627"
        height="13.4484"
        transform="rotate(45 12.4688 3.80469)"
        fill={light ? '#ffffff' : '#00507C'}
      />
      <path
        d="M2.18718 18.4489L7.32229 17.6881L2.94793 13.3138L2.18718 18.4489Z"
        fill={light ? '#ffffff' : '#00507C'}
      />
    </svg>
  );
}

export function RemoveIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 2L8.5 8.5M15 2L8.5 8.5M15 15L8.5 8.5M2 15L8.5 8.5"
        stroke="#99999F"
        strokeWidth="3"
      />
    </svg>
  );
}

export function DropDownTriangle() {
  return (
    <svg
      width="22"
      height="13"
      viewBox="0 0 22 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.8636 9.53674e-07L10.9318 13L0 9.53674e-07H21.8636Z"
        fill="#DCDCE0"
      />
    </svg>
  );
}

export function InvertedDropDownTriangle() {
  return (
    <svg
      width="22"
      height="13"
      viewBox="0 0 22 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M21.8636 13L10.9318 0L0 13H21.8636Z" fill="#DCDCE0" />
    </svg>
  );
}

export function AddButton() {
  return (
    <svg
      width="50"
      height="50"
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="25" cy="25" r="25" />
      <path
        d="M25.5185 11V24.4815M25.5185 39V24.4815M25.5185 24.4815H39M25.5185 24.4815H11"
        stroke="#00507C"
        strokeWidth="4"
      />
    </svg>
  );
}

export function MessageIcon() {
  return (
    <svg
      width="20"
      height="16"
      viewBox="0 0 20 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18 0H2C0.9 0 0.00999999 0.9 0.00999999 2L0 14C0 15.1 0.9 16 2 16H18C19.1 16 20 15.1 20 14V2C20 0.9 19.1 0 18 0ZM18 4L10 9L2 4V2L10 7L18 2V4Z"
        fill="#00507C"
      />
    </svg>
  );
}

export function AttentionIcon() {
  return (
    <svg viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="2.82843"
        y="12.728"
        width="14"
        height="14"
        transform="rotate(-45 2.82843 12.728)"
        stroke="url(#paint0_linear)"
        strokeWidth="4"
      />
      <defs>
        <linearGradient
          id="paint0_linear"
          x1="9"
          y1="12.728"
          x2="7.03794"
          y2="45.2136"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00507C" />
          <stop offset="1" stopColor="#00507C" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function PinIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="pin-icon"
    >
      <circle
        cx="16"
        cy="16"
        r="15"
        fill="white"
        stroke="#00507C"
        strokeWidth="2"
      />
      <path
        d="M15.9041 22.7205L15.0921 17.9746L12.4839 17.967V17.5783C12.4839 16.9953 12.7948 16.4318 13.3001 16.1403C13.9025 14.333 13.883 12.895 13.2223 11.0489C12.7559 10.738 12.4839 10.2133 12.4839 9.64974V9.28052H19.8295V9.66917C19.8295 10.2327 19.5574 10.7574 19.091 11.0683C18.4303 12.895 18.4109 14.3525 19.0133 16.1597C19.5186 16.4707 19.8295 17.0148 19.8295 17.5978V17.9864L17.4105 17.9746L16.3899 22.7205H15.9041ZM13.3389 17.1897H15.9041H16.3899H18.955C18.8578 16.9953 18.7218 16.8399 18.5275 16.7621L18.372 16.6844L18.3332 16.5484C17.6141 14.4885 17.6336 12.7784 18.4109 10.6797L18.4692 10.5436L18.5858 10.4659C18.7607 10.3688 18.8773 10.2327 18.9744 10.0578H13.3389C13.4167 10.2327 13.5527 10.3688 13.7276 10.4659L13.8442 10.5436L13.9025 10.6797C14.6798 12.7784 14.6992 14.4885 13.9802 16.5484L13.9219 16.7038L13.7665 16.7816C13.5721 16.8593 13.4361 17.0148 13.3389 17.1897Z"
        fill="#00507C"
      />
    </svg>
  );
}

export function NewsIcon({backgroundShade}) {
  return (
    <svg
      width="48"
      height="43"
      viewBox="0 0 48 43"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.2202 42.8627C13.8202 42.8627 14.3202 42.7627 14.8202 42.4627L16.2202 41.7627C18.1202 40.8627 19.0202 38.5627 18.1202 36.6627L15.8202 31.7627L15.2202 31.8627L9.12022 34.6627C8.52022 34.9627 7.92021 35.1627 7.22021 35.2627L9.72021 40.5627C10.4202 42.0627 11.7202 42.8627 13.2202 42.8627Z"
        fill={backgroundShade === 'dark' ? '#ffffff' : '#00507C'}
      />
      <path
        d="M36.7199 6.76265C37.2199 6.96265 37.8199 6.66265 38.0199 6.16265L39.8199 1.36265C40.0199 0.862646 39.7199 0.262646 39.2199 0.0626462C38.7199 -0.137354 38.1199 0.162646 37.9199 0.662646L36.1199 5.46265C35.9199 6.06265 36.1199 6.56265 36.7199 6.76265Z"
        fill={backgroundShade === 'dark' ? '#ffffff' : '#00507C'}
      />
      <path
        d="M42.2203 11.3628L46.9203 9.16277C47.4203 8.96277 47.6203 8.36277 47.4203 7.86277C47.2203 7.36277 46.6203 7.16277 46.1203 7.36277L41.3203 9.46277C40.8203 9.66277 40.6203 10.2628 40.8203 10.7628C41.1203 11.3628 41.7203 11.5628 42.2203 11.3628Z"
        fill={backgroundShade === 'dark' ? '#ffffff' : '#00507C'}
      />
      <path
        d="M42.5204 16.0626C42.0204 15.8626 41.4204 16.1626 41.2204 16.6626C41.0204 17.1626 41.3204 17.7626 41.8204 17.9626L46.6204 19.7626C47.1204 19.9626 47.7204 19.6626 47.9204 19.1626C48.1204 18.6626 47.8204 18.0626 47.3204 17.8626L42.5204 16.0626Z"
        fill={backgroundShade === 'dark' ? '#ffffff' : '#00507C'}
      />
      <path
        d="M1.52014 30.5626C2.32014 32.3626 4.12014 33.5626 6.12014 33.5626C6.82014 33.5626 7.62014 33.3626 8.22014 33.0626L14.5201 30.1626L14.9201 30.0626L9.02014 18.6626L3.02014 21.4626C1.82014 22.0626 0.820139 23.0626 0.320139 24.3626C-0.179861 25.6626 -0.0798609 27.0626 0.520139 28.2626L1.52014 30.5626Z"
        fill={backgroundShade === 'dark' ? '#ffffff' : '#00507C'}
      />
      <path
        d="M35.52 27.2627C35.82 27.2627 36.12 27.0627 36.22 26.7627C36.32 26.4627 36.42 26.1627 36.22 25.8627L26.32 4.66267C26.22 4.36267 25.92 4.16267 25.62 4.06267C25.32 3.96267 25.02 4.06267 24.72 4.26267L10.52 17.2627L17.12 29.6627L35.52 27.2627Z"
        fill={backgroundShade === 'dark' ? '#ffffff' : '#00507C'}
      />
      <path
        d="M36.7201 18.0625C37.3201 16.3625 37.2201 14.5625 36.5201 12.9625C35.4201 10.6625 33.1201 9.1625 30.6201 9.0625L35.7201 19.9625C36.1201 19.3625 36.5201 18.6625 36.7201 18.0625Z"
        fill={backgroundShade === 'dark' ? '#ffffff' : '#00507C'}
      />
    </svg>
  );
}

export function NextPreviousInReelIcon({isNext}) {
  return (
    <svg viewBox="0 0 31 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_d)">
        {isNext ? (
          <path
            d="M27 16.1125L4.5 31.7984L4.5 0.426615L27 16.1125Z"
            fill="#00507C"
          />
        ) : (
          <path
            d="M4 16.1125L26.5 31.7984L26.5 0.426615L4 16.1125Z"
            fill="#00507C"
          />
        )}
      </g>
      <defs>
        <filter
          id="filter0_d"
          x="0.5"
          y="0.426514"
          width="30.5"
          height="39.3718"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}
