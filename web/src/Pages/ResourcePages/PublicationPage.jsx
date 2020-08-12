import React from 'react';

import getFilteredPosts from '../../mockdata/posts';
import journals from '../../mockdata/journals';
import {useParams} from 'react-router-dom';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import Sider from '../../components/Layout/Sider/Sider';

import './PublicationPage.css';
export default function PublicationPage({search}) {
  const publicationID = useParams().id;
  const matchedPublication = getFilteredPosts([]).filter((post) =>
    post.id.includes(publicationID)
  )[0];

  const topicIDs = matchedPublication.topics.map((topic) => topic.id);

  const findSimilarPublications = () => {
    const uniquePosts = [];
    topicIDs.map((topicID) => {
      const resourcePosts = getFilteredPosts([]).filter(
        (post) => post.category === 'resource'
      );
      const postsWithSameTopic = resourcePosts.filter((post) =>
        post.topics[0].id.includes(topicID)
      );

      postsWithSameTopic.map((post) => {
        if (uniquePosts.includes(post.id)) return;
        uniquePosts.push(post);
      });
    });
    return uniquePosts.slice(0, 5);
  };

  const detectJournal = () => {
    const journalName = journals.filter((journal) =>
      matchedPublication.url.toLowerCase().includes(journal.name.toLowerCase())
    );
    return journalName;
  };

  return (
    <>
      <div className="sider-layout">
        <Sider>
          <div className="publication-sider">
            <h3 className="sider-title">Other Publications from your Search</h3>
            <div className="suggested-publications-container">
              {findSimilarPublications().map((publication) => (
                <div className="suggested-publication">{publication.title}</div>
              ))}
            </div>
          </div>
        </Sider>
      </div>
      <div className="content-layout">
        <div className="publication-header">
          {detectJournal().length === 0 ? null : (
            <img
              className="publication-journal-logo"
              src={detectJournal()[0].logo}
              alt={`${detectJournal()[0].name} journal logo`}
            />
          )}
          {matchedPublication.url ? (
            <a href={matchedPublication.url} target="_blank">
              Go to full article
            </a>
          ) : null}
        </div>
        <div className="publication-body">
          <h2>{matchedPublication.title}</h2>
          {matchedPublication.content.authors.map((author) => (
            <h3 className="publication-body-authors">
              <Link to="/profile">{author}</Link>
            </h3>
          ))}
          <p className="publication-body-abstract">
            {matchedPublication.content.abstract}
          </p>
          <PostTopics publication={matchedPublication} />
        </div>
      </div>
    </>
  );
}

function PostTopics({publication}) {
  return (
    <div className="post-topics">
      <p className="topics-sub-title">Topics: </p>
      <div className="topic-names-container">
        {publication.topics.map((topic) => (
          <a key={topic.id} href="/" className="topic-names">
            {topic.name}{' '}
          </a>
        ))}
      </div>
    </div>
  );
}
PostTopics.propTypes = {
  topics: PropTypes.arrayOf(
    PropTypes.exact({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
};
