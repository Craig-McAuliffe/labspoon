import React, {useState, useContext} from 'react';
import {Link} from 'react-router-dom';
import {v4 as uuid} from 'uuid';
import {ExpandIcon, HideIcon} from '../../assets/PostActionIcons';
import PostActions from '../Posts/Post/PostParts/PostActions';
import detectJournal from '../Publication/DetectJournal';
import ListItemTopics from '../CommonListItemParts/ListItemTopics';
import {FeatureFlags} from '../../App';

import './PublicationListItem.css';

export default function PublicationListItem({
  publication,
  removeBorder,
  mixedResults,
  bookmarkedVariation,
}) {
  const featureFlags = useContext(FeatureFlags);

  let publicationURL;
  if (publication.id) {
    publicationURL = `/publication/${publication.id}`;
  } else if (publication.microsoftID) {
    publicationURL = `/magPublication/${publication.microsoftID}`;
  }

  return (
    <div
      className={
        removeBorder
          ? 'publication-list-item-container-noBorder'
          : 'publication-list-item-container'
      }
    >
      <PublicationListItemHeader publication={publication} />
      <div className="publication-list-item-content">
        <PublicationListItemTitle
          url={publicationURL}
          title={publication.title}
        />
        <PublicationListItemAuthors authors={publication.authors} />
        {mixedResults ? null : (
          <div className="publication-list-item-topics-container">
            <ListItemTopics taggedItem={publication} />
          </div>
        )}
      </div>
      <PublicationListItemAbstract abstract={publication.abstract} />
      {mixedResults ||
      (featureFlags.has('bookmark-publications') && !bookmarkedVariation) ? (
        <PostActions />
      ) : null}
    </div>
  );
}

function PublicationListItemHeader({publication}) {
  const fflags = useContext(FeatureFlags);

  let journal;
  if (fflags.has('publisher-logos') && detectJournal(publication).length > 0) {
    publication = (
      <img
        className="publication-list-item-journal-logo"
        src={detectJournal(publication)[0].logo}
        alt={`${detectJournal(publication)[0].name} journal logo`}
      />
    );
  } else if (publication.journal) {
    journal = <h1>{publication.journal}</h1>;
  } else {
    journal = <h1>Journal Article</h1>;
  }
  return (
    <div className="publication-list-item-header">
      <div className="publication-list-item-journal-container">{journal}</div>
      <p className="publication-list-item-date">{publication.datePublished}</p>
    </div>
  );
}

function PublicationListItemTitle({url, title}) {
  const titleHeader = <h3 className="publication-list-item-title">{title}</h3>;
  if (!url) return titleHeader;
  return <Link to={url}>{titleHeader}</Link>;
}

function PublicationListItemAuthors({authors}) {
  return (
    <div className="publication-list-item-content-authors">
      {authors.map((author) => (
        <PublicationListItemAuthor
          ID={author.id}
          name={author.name}
          key={uuid()}
        />
      ))}
    </div>
  );
}

function PublicationListItemAuthor({ID, name}) {
  const authorHeader = <h4 key={uuid()}>{name}</h4>;
  if (!ID) return authorHeader;
  return (
    <Link className="publication-list-item-content-author" to={`users/${ID}`}>
      {authorHeader}
    </Link>
  );
}

function PublicationListItemAbstract({abstract}) {
  const [displayAbstract, setDisplayAbstract] = useState(false);
  if (!abstract) return <></>;
  const expandedView = () =>
    displayAbstract ? (
      <p className="publication-list-item-abstract">{abstract}</p>
    ) : null;
  return (
    <>
      <button
        className="publication-list-item-expand-button"
        onClick={() => setDisplayAbstract((current) => !current)}
      >
        <div className="publication-list-item-expand">
          {!displayAbstract ? (
            <>
              <ExpandIcon /> <div>Read Abstract</div>
            </>
          ) : (
            <>
              <HideIcon />
              <div>Hide Abstract</div>
            </>
          )}
        </div>
      </button>
      {expandedView()}
    </>
  );
}
