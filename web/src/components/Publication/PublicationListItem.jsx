import React, {useState, useContext} from 'react';
import {Link} from 'react-router-dom';
import {ExpandIcon, HideIcon} from '../../assets/PostActionIcons';
import PostActions from '../Posts/Post/PostParts/PostActions';
import detectJournal from '../Publication/DetectJournal';
import ListItemTopics from '../ListItem/ListItemTopics';
import {FeatureFlags} from '../../App';

import './PublicationListItem.css';
import {getLinkForAuthor} from '../../helpers/publications';

export default function PublicationListItem({
  publication,
  removeBorder,
  mixedResults,
  bookmarkedVariation,
}) {
  const featureFlags = useContext(FeatureFlags);
  const publicationPathName = getPublicationPathName(publication);
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
          pathName={publicationPathName}
          title={publication.title}
        />
        <PublicationListItemAuthors authors={publication.authors} />
        {mixedResults ? null : (
          <div className="publication-list-item-topics-container">
            <ListItemTopics dbTopics={publication.topics} />
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
  const publicationPathName = getPublicationPathName(publication);
  return (
    <div className="publication-list-item-container">
      <PublicationListItemTitle
        pathName={publicationPathName}
        title={publication.title}
      />
      <PublicationListItemAuthors authors={publication.authors} />
      {children}
    </div>
  );
}

function getPublicationPathName(publication) {
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
    journal = <h4>{publication.journal}</h4>;
  } else {
    journal = <h4>Journal Article</h4>;
  }
  return (
    <div className="publication-list-item-header">
      <div className="publication-list-item-journal-container">{journal}</div>
      <p className="publication-list-item-date">{publication.datePublished}</p>
    </div>
  );
}

function PublicationListItemTitle({pathName, title}) {
  const titleHeader = <h3 className="publication-list-item-title">{title}</h3>;
  if (!pathName) return titleHeader;
  return <Link to={pathName}>{titleHeader}</Link>;
}

// the max number of authors to display at a time
const AUTHORS_DISPLAY_LIMIT = 3;

function PublicationListItemAuthors({authors}) {
  if (!authors) return <></>;
  // MS Publications have duplication
  const seenMicrosoftIDs = new Set();
  const uniqueAuthors = [];
  authors.forEach((possiblyDuplicateAuthor) => {
    if (!possiblyDuplicateAuthor.microsoftID) return;
    if (seenMicrosoftIDs.has(possiblyDuplicateAuthor.microsoftID)) return;
    uniqueAuthors.push(possiblyDuplicateAuthor);
    seenMicrosoftIDs.add(possiblyDuplicateAuthor.microsoftID);
  });
  let authorsList;
  if (uniqueAuthors.length <= AUTHORS_DISPLAY_LIMIT) {
    authorsList = authorsToAuthorList(uniqueAuthors);
  } else {
    authorsList = authorsToAuthorList(
      uniqueAuthors.slice(0, AUTHORS_DISPLAY_LIMIT)
    );
    const remainingCount = uniqueAuthors.length - AUTHORS_DISPLAY_LIMIT;
    authorsList.push(
      <h4 key="authors spill over">
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
      microsoftID={author.microsoftID}
      name={author.name}
      key={(author.id || author.microsoftID) + idx}
      first={idx === 0}
      last={idx === authors.length - 1}
    />
  ));
}

function PublicationListItemAuthor({id, microsoftID, name, first, last}) {
  let nameStr;
  if (first && !last) {
    nameStr = `${name},`;
  } else if (first && last) {
    nameStr = `${name}`;
  } else {
    nameStr = `and ${name}`;
  }
  const authorLink = getLinkForAuthor(id, microsoftID, nameStr);
  return (
    <h4 className="publication-list-item-content-author" key={id + ' ' + name}>
      {authorLink}&nbsp;
    </h4>
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
