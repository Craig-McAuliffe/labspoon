import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {Expand, Hide} from '../../assets/PostActionIcons';
import PostActions from '../Posts/Post/PostParts/PostActions';
import detectJournal from '../../components/Publication/DetectJournal';

import './PublicationListItem.css';

export default function PublicationListItem({publication}) {
  const [displayAbstract, setDisplayAbstract] = useState(false);
  const expandedView = () =>
    displayAbstract ? (
      <p className="publication-listItem-abstract">
        {publication.content.abstract}
      </p>
    ) : null;
  return (
    <div className="publication-listItem-container">
      <div className="publication-listItem-header">
        <div className="publication-listItem-journal-container">
          {detectJournal(publication).length > 0 ? (
            <img
              className="publication-listItem-journal-logo"
              src={detectJournal(publication)[0].logo}
              alt={`${detectJournal(publication)[0].name} journal logo`}
            />
          ) : (
            <div className="publication-listItem-journal-container"></div>
          )}
        </div>
        <p className="publication-listItem-date">{publication.datePublished}</p>
      </div>
      <div className="publication-listItem-content">
        <Link to={`/publication/${publication.id}`}>
          <h3 className="publication-listItem-title">{publication.title}</h3>
        </Link>
        <div className="publication-listItem-content-authors">
          {publication.content.authors.map((author) => (
            <h4 key={author.id}>
              <Link
                to={`/user/${author.id}`}
                className="publication-listItem-content-author"
              >
                {author.name}
              </Link>
            </h4>
          ))}
        </div>
      </div>
      <button
        className="publication-listItem-expand-button"
        onClick={() => setDisplayAbstract((current) => !current)}
      >
        <div className="publication-listItem-expand">
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
