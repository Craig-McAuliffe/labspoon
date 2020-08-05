import React, {useState} from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import Post from '../Post/Post';

import './PostList.css';

const testData = [];
for (let i = 0; i < 20; i++) {
  testData.push(
    {
      id: 'o3bosfseself' + i,
      title:
        'The National Lung Matrix Trial of personalized therapy in lung' +
        ' cancer ',
      type: 'open position',
      author: {
        name: 'Patrick Leask',
        id: '283h8wef8shef',
        avatar:
          'https://i.picsum.photos/id/804/200/200.jpg?hmac=73qw3Bnt67aOsdWd033BvfX9Gq0gIJ6FSL3Dp3gA97E',
      },
      content: {
        text: 'This is an example of a text post!',
      },
      topics: [
        {
          id: 'slkdfjsfioef',
          name: 'Biology',
        },
        {
          id: '283oiwef',
          name: 'Physics',
        },
        {
          id: 'zkjdf8oziow',
          name: 'Astronomy',
        },
      ],
      optionaltags: [
        {
          type: 'location',
          content: 'London, United Kingdom',
        },
        {
          type: 'methods',
          content: 'Microsoft Excel',
        },
        {
          type: 'start date',
          content: '2nd January 2021',
        },
        {
          type: 'salary',
          content: '£0.01',
        },
        {
          type: 'funder',
          content: 'GSK',
        },
        {
          type: 'amount',
          content: '$1 Billion',
        },
        {
          type: 'researcher',
          content: {
            researcher: {
              name: 'Craig McAuliffe',
              id: '57ajf92',
            },
          },
        },
      ],
    },
    {
      id: 'o3bosfseself' + i,
      title:
        'The National Lung Matrix Trial of personalized therapy in lung' +
        ' cancer ',
      type: 'news',
      author: {
        name: 'Patrick Leask',
        id: '283h8wef8shef',
        avatar:
          'https://i.picsum.photos/id/804/200/200.jpg?hmac=73qw3Bnt67aOsdWd033BvfX9Gq0gIJ6FSL3Dp3gA97E',
      },
      content: {
        text: 'This is an example of a text post!',
      },
      topics: [
        {
          id: 'slkdfjsfioef',
          name: 'Biology',
        },
        {
          id: '283oiwef',
          name: 'Physics',
        },
        {
          id: 'zkjdf8oziow',
          name: 'Astronomy',
        },
      ],
      optionaltags: [],
    },
    {
      id: 'o3bosfseself' + i,
      title:
        'The National Lung Matrix Trial of personalized therapy in lung' +
        ' cancer ',
      type: 'publication',
      author: {
        name: 'Patrick Leask',
        id: '283h8wef8shef',
        avatar:
          'https://i.picsum.photos/id/804/200/200.jpg?hmac=73qw3Bnt67aOsdWd033BvfX9Gq0gIJ6FSL3Dp3gA97E',
      },
      content: {
        text: 'This is an example of a text post!',
      },
      topics: [
        {
          id: 'slkdfjsfioef',
          name: 'Biology',
        },
        {
          id: '283oiwef',
          name: 'Physics',
        },
        {
          id: 'zkjdf8oziow',
          name: 'Astronomy',
        },
      ],
      optionaltags: [
        {
          type: 'start date',
          content: '2nd January 2021',
        },
        {
          type: 'salary',
          content: '£0.01',
        },
        {
          type: 'funder',
          content: 'GSK',
        },
      ],
    }
  );
}

function fetchTestData(skip, limit) {
  return testData
    .slice(skip, skip + limit)
    .map((val) => <Post key={val.id} content={val} />);
}

export default function PostList() {
  const limit = 8;
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const [results, setResults] = useState(fetchTestData(skip, limit));

  function fetchMore() {
    setSkip(skip + limit);
    const newResults = fetchTestData(skip + limit, limit);
    if (newResults.length < limit) {
      setHasMore(false);
    }
    setResults(results.concat(newResults));
  }

  return (
    <div className="feed-container">
      <div className="feed-items">
        <InfiniteScroll
          dataLength={results.length}
          hasMore={hasMore}
          next={fetchMore}
          loader={<p>Loading...</p>}
          endMessage={<p>No more results</p>}
          style={{'min-width': '100%'}}
        >
          {results}
        </InfiniteScroll>
      </div>
    </div>
  );
}
