import React from 'react';

import publications from '../../mockdata/publications';
import journals from '../../mockdata/journals';
import {useParams} from 'react-router-dom';
import FeedItemTopics from '../../components/FeedItems/FeedItemTopics';
import {Link} from 'react-router-dom';
import Sider from '../../components/Layout/Sider/Sider';

import './PublicationPage.css';
export default function PublicationPage({search}) {
  const publicationID = useParams().id;
  const matchedPublication = publications().filter((publication) =>
    publication.id.includes(publicationID)
  )[0];

  const topicIDs = matchedPublication.topics.map((topic) => topic.id);

  const findSimilarPublications = () => {
    const uniquePosts = [];
    topicIDs.map((topicID) => {
      const resourcePosts = publications().filter(
        (publication) => publication.category === 'resource'
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
  // console.log(publicationID);
  // console.log(publications());
  // console.log(matchedPublication);
  return (
    <>
      <div className="sider-layout">
        <Sider>
          <div className="publication-sider">
            <h3 className="sider-title">Other Publications from your Search</h3>
            <div className="suggested-publications-container">
              <SimilarPublications publications={findSimilarPublications()} />
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
          <PublicationLink publicationUrl={matchedPublication.url} />
        </div>
        <div className="publication-body">
          <h2>{matchedPublication.title}</h2>
          <PublicationAuthors
            publicationAuthors={matchedPublication.content.authors}
          />
          <h3 className="publication-section-title">Abstract</h3>
          <p className="publication-body-abstract">
            {matchedPublication.content.abstract}
          </p>
          <FeedItemTopics taggedItem={matchedPublication} />
        </div>
      </div>
    </>
  );
}

const PublicationLink = ({publicationUrl}) =>
  publicationUrl ? (
    <a href={publicationUrl} target="_blank">
      Go to full article
    </a>
  ) : null;

const PublicationAuthors = ({publicationAuthors}) =>
  publicationAuthors.map((author) => (
    <h3 className="publication-body-authors">
      <Link to={`/profile/${author.id}`}>{author.name}</Link>
    </h3>
  ));

const SimilarPublications = ({publications}) =>
  publications.map((publication) => (
    <div className="suggested-publication">
      <Link to={`/publication/${publication.id}`}>{publication.title}</Link>
    </div>
  ));
