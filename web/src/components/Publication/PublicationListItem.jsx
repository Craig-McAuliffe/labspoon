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
  const publicationURL = getPublicationURL(publication);
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

export function SmallPublicationListItem({publication, children}) {
  const publicationURL = getPublicationURL(publication);
  return (
    <div className={'publication-list-item-container'}>
      <PublicationListItemTitle
        url={publicationURL}
        title={publication.title}
      />
      <PublicationListItemAuthors authors={publication.authors} />
      {children}
    </div>
  );
}

function getPublicationURL(publication) {
  if (publication.id) {
    return `/publication/${publication.id}`;
  } else if (publication.microsoftID) {
    return `/magPublication/${publication.microsoftID}`;
  }
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

// the max number of authors to display at a time
const AUTHORS_DISPLAY_LIMIT = 3;

function PublicationListItemAuthors({authors}) {
  if (!authors) return <></>;
  let authorsList;
  if (authors.length <= AUTHORS_DISPLAY_LIMIT) {
    authorsList = authorsToAuthorList(authors);
  } else {
    authorsList = authorsToAuthorList(authors.slice(0, AUTHORS_DISPLAY_LIMIT));
    const remainingCount = authors.length - AUTHORS_DISPLAY_LIMIT;
    authorsList.push(
      <h4>
        and {remainingCount} other{remainingCount > 1 ? 's' : ''}
      </h4>
    );
  }
  return (
    <div className="publication-list-item-content-authors">{authorsList}</div>
  );
}

function authorsToAuthorList(authors) {
  return authors.map((author, idx) => (
    <PublicationListItemAuthor
      ID={author.id}
      name={author.name}
      key={uuid()}
      first={idx === 0}
      last={idx === authors.length - 1}
    />
  ));
}

function PublicationListItemAuthor({ID, name, first, last}) {
  let nameStr;
  if (first && !last) {
    nameStr = `${name},`;
  } else if (first && last) {
    nameStr = `${name}`;
  } else {
    nameStr = `and ${name}`;
  }
  const authorHeader = <h4 key={uuid()}>{nameStr}&nbsp;</h4>;
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
