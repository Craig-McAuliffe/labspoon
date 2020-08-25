import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {Expand, Hide} from '../../assets/PostActionIcons';
import PostActions from '../Posts/Post/PostParts/PostActions';
import detectJournal from '../Publication/DetectJournal';
import FeedItemTopics from '../FeedItems/FeedItemTopics';

import './PublicationListItem.css';

export default function PublicationListItem({publication, removeBorder}) {
  const [displayAbstract, setDisplayAbstract] = useState(false);
  const expandedView = () =>
    displayAbstract ? (
      <p className="publication-list-item-abstract">
        {publication.content.abstract}
      </p>
    ) : null;
  return (
    <div
      className={
        removeBorder
          ? 'publication-list-item-container-noBorder'
          : 'publication-list-item-container'
      }
    >
      <div className="publication-list-item-header">
        <div className="publication-list-item-journal-container">
          {detectJournal(publication).length > 0 ? (
            <img
              className="publication-list-item-journal-logo"
              src={detectJournal(publication)[0].logo}
              alt={`${detectJournal(publication)[0].name} journal logo`}
            />
          ) : (
            <div className="publication-list-item-journal-container"></div>
          )}
        </div>
        <p className="publication-list-item-date">
          {publication.datePublished}
        </p>
      </div>
      <div className="publication-list-item-content">
        <Link to={`/publication/${publication.id}`}>
          <h3 className="publication-list-item-title">{publication.title}</h3>
        </Link>
        <div className="publication-list-item-content-authors">
          {publication.content.authors.map((author) => (
            <h4 key={author.id}>
              <Link
                to={`/user/${author.id}`}
                className="publication-list-item-content-author"
              >
                {author.name}
              </Link>
            </h4>
          ))}
        </div>
        <div className="publication-list-item-topics-container">
          <FeedItemTopics taggedItem={publication} />
        </div>
      </div>
      <button
        className="publication-list-item-expand-button"
        onClick={() => setDisplayAbstract((current) => !current)}
      >
        <div className="publication-list-item-expand">
          {!displayAbstract ? (
            <>
              <Expand /> <div>Read Abstract</div>
            </>
          ) : (
            <>
              <Hide />
              <div>Hide Abstract</div>
            </>
          )}
        </div>
      </button>
      {expandedView()}
      <PostActions />
    </div>
  );
}
