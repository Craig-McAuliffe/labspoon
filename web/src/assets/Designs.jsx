import React from 'react';

import './Designs.css';
export function CreatePostBackgroundSwirl({disappearEffect}) {
  return (
    <svg viewBox="0 0 750 270" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        className={
          disappearEffect ? 'create-post-background-swirl-fadeOut' : ''
        }
        d="M748.5 5.31947C573.172 -6.07871 510.5 -8.18056 341 175.319C171.5 358.819 214.5 64.3195 152.5 139.819"
        stroke="url(#paint0_linear)"
      />
      <path
        className={
          disappearEffect ? 'create-post-background-swirl-fadeOut' : ''
        }
        d="M290.052 111.953C344.695 216.65 452.51 294.522 539 261.819C639.5 223.819 685.333 119.486 748.5 45.8193L748 4.81934C684.833 78.486 639 182.819 538.5 220.819C452.52 253.329 345.099 206.939 290.052 111.953Z"
        fill="url(#paint1_linear)"
      />
      <path
        className={
          disappearEffect ? 'create-post-background-swirl-fadeOut' : ''
        }
        d="M1 198.819L268 59.3193C273.744 77.3303 281.2 94.9934 290.052 111.953M267 59.8193C272.953 78.4857 280.756 95.9121 290.052 111.953M290.052 111.953C344.695 216.65 452.51 294.522 539 261.819C639.5 223.819 685.333 119.486 748.5 45.8193L748 4.81934C684.833 78.486 639 182.819 538.5 220.819C452.52 253.329 345.099 206.939 290.052 111.953Z"
        stroke="url(#paint2_linear)"
      />
      <defs>
        <linearGradient
          id="paint0_linear"
          x1="602.5"
          y1="52.7481"
          x2="318.5"
          y2="168.748"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#78B9DD" />
          <stop offset="1" stopColor="#417998" stopOpacity="0.46" />
        </linearGradient>
        <linearGradient
          id="paint1_linear"
          x1="791"
          y1="4.81932"
          x2="210.5"
          y2="171.319"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3B9FD6" />
          <stop offset="1" stopColor="#D1E4EE" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint2_linear"
          x1="734"
          y1="30.3193"
          x2="156.5"
          y2="148.319"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#C6E5F7" />
          <stop offset="1" stopColor="#00507C" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
