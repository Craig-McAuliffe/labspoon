import React from 'react';

import './Content.css';

export default function Content({children, backgroundShade}) {
  return (
    <div
      className={`content-layout-${
        backgroundShade ? backgroundShade : 'light'
      }`}
    >
      {children}
    </div>
  );
}

export function FeedContainer({children, backgroundShade}) {
  return (
    <div
      className={`feed-container-${
        backgroundShade ? backgroundShade : 'light'
      }`}
    >
      {children}
    </div>
  );
}

export function UnpaddedPageContainer({children, backgroundShade}) {
  return (
    <Content>
      <FeedContainer backgroundShade={backgroundShade}>
        {children}
      </FeedContainer>
    </Content>
  );
}

export function PaddedPageContainer({children, backgroundShade}) {
  return (
    <UnpaddedPageContainer>
      <PaddedContent backgroundShade={backgroundShade}>
        {children}
      </PaddedContent>
    </UnpaddedPageContainer>
  );
}

export function PaddedContent({children, backgroundShade}) {
  return (
    <div
      className={`padded-page-container-${
        backgroundShade ? backgroundShade : 'light'
      }`}
    >
      {children}
    </div>
  );
}
