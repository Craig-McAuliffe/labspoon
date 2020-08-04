import React, {useState} from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import Post from '../Post/Post';

const testData = [];
for (let i = 0; i < 20; i++) {
  testData.push({
    id: 'o3bosfseself' + i,
    title:
      'The National Lung Matrix Trial of personalized therapy in lung' +
      ' cancer ',
    type: 'text',
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
  });
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
    <InfiniteScroll
      dataLength={results.length}
      hasMore={hasMore}
      next={fetchMore}
      loader={<p>Loading...</p>}
      endMessage={<p>No more results</p>}
    >
      {results}
    </InfiniteScroll>
  );
}
