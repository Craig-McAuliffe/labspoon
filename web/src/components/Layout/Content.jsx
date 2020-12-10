import React from 'react';

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

export function PageContentContainer({children}) {
  return <div className="page-content-container">{children}</div>;
}
