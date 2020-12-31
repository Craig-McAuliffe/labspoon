import React from 'react';

import './Content.css';

export default function Content({children}) {
  return <div className="content-layout">{children}</div>;
}

export function FeedContainer({children}) {
  return <div className="feed-container">{children}</div>;
}

export function UnpaddedPageContainer({children}) {
  return (
    <Content>
      <FeedContainer>{children}</FeedContainer>
    </Content>
  );
}

export function PaddedPageContainer({children}) {
  return (
    <UnpaddedPageContainer>
      <PaddedContent>{children}</PaddedContent>
    </UnpaddedPageContainer>
  );
}

export function PaddedContent({children}) {
  return <div className="padded-page-container">{children}</div>;
}
