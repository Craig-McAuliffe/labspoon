import React from 'react';

import './Content.css';

export default function Content({children}) {
  return <div className="content-layout">{children}</div>;
}

export function FeedContainer({children}) {
  return <div className="feed-container">{children}</div>;
}

export function FeedContent({children}) {
  return (
    <Content>
      <FeedContainer>{children}</FeedContainer>
    </Content>
  );
}

export function PageContainer({children}) {
  return (
    <Content>
      <div className="padded-page-container">{children}</div>
    </Content>
  );
}

export function PaddedPageContent({children}) {
  return <div className="padded-page-container">{children}</div>;
}
