import React, {useState, useEffect} from 'react';
import {Redirect} from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner/LoadingSpinner';

export default function MAGRouterDisplay({query, formatRedirectPath}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [resultID, setResultID] = useState();

  useEffect(() => {
    query
      .get()
      .then((qs) => {
        if (qs.empty) setError(<NotFound />);
        qs.forEach((doc) => {
          setResultID(doc.id);
        });
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        setError(<Error />);
        console.error(err);
      });
  }, [query]);

  if (error) return error;
  if (loading) return <LoadingSpinner />;

  return <Redirect to={formatRedirectPath(resultID)} />;
}

const NotFound = () => (
  <>
    <h1>Not Found</h1>
    <p>
      This probably just means we haven&rsquo;t had a chance to process this
      resource yet. That means you&rsquo; literally faster than the speed of
      light travelling through our data centres. Whilst you&rsquo;ve been
      distracted by this message, we&rsquo;ve probably had a chance to catch up
      with you, so just hit reload!
    </p>
  </>
);

const Error = () => <h1>An error occurred</h1>;
