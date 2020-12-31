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
      <div className="page-content-container">{children}</div>
    </Content>
  );
}

export function ResourcePageDetailsContainer({children}) {
  return <div className="resources-details-container">{children}</div>;
}
