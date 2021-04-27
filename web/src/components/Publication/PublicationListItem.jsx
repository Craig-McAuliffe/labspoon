import React, {useState, useContext} from 'react';
import {Link} from 'react-router-dom';
import {ExpandIcon, HideIcon} from '../../assets/PostActionIcons';
import PostActions from '../Posts/Post/PostParts/PostActions';
import detectJournal from '../Publication/DetectJournal';
import ListItemTopics from '../ListItem/ListItemTopics';
import {FeatureFlags} from '../../App';

import './PublicationListItem.css';
import {
  getLinkForAuthor,
  getUniqueAuthorsFromAuthors,
} from '../../helpers/publications';
import {
  ListItemOptionsDropdown,
  PIN,
} from '../ListItem/ListItemCommonComponents';
import {PUBLICATION} from '../../helpers/resourceTypeDefinitions';
import {LIGHT_NAME_SHADE} from '../../pages/ResourcePages/GroupPage/EditGroupDisplay';

export default function PublicationListItem({
  publication,
  removeBorder,
  mixedResults,
  bookmarkedVariation,
  noLink,
  onPost,
}) {
  const backgroundShade = publication.backgroundShade
    ? publication.backgroundShade
    : LIGHT_NAME_SHADE;
  const featureFlags = useContext(FeatureFlags);
  const publicationPathName = getPublicationPathName(publication);
  return (
    <div
      className={`publication-list-item-container${
        removeBorder ? '-noBorder' : ''
      }-${backgroundShade}`}
    >
      <PublicationListItemHeader publication={publication} />
      <div className="publication-list-item-content">
        <PublicationListItemTitle
          pathName={publicationPathName}
          title={publication.title}
          noLink={noLink}
          backgroundShade={backgroundShade}
        />
        <PublicationListItemAuthors
          backgroundShade={backgroundShade}
          authors={publication.authors}
        />
        {mixedResults || onPost ? null : (
          <div className="publication-list-item-topics-container">
            <ListItemTopics
              backgroundShade={backgroundShade}
              dbTopics={publication.topics}
            />
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
    <div
      className={`publication-list-item-container-${
        publication.backgroundShade
          ? publication.backgroundShade
          : LIGHT_NAME_SHADE
      }`}
    >
      <PublicationListItemTitle
        pathName={publicationPathName}
        title={publication.title}
        backgroundShade={publication.backgroundShade}
      />
      <PublicationListItemAuthors
        backgroundShade={publication.backgroundShade}
        authors={publication.authors}
      />
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
    <>
      <div className="publication-list-item-header">
        <div>
          <div className="publication-list-item-journal-container">
            {journal}
          </div>
          <p
            className={`publication-list-item-date-${
              publication.backgroundShade
                ? publication.backgroundShade
                : 'light'
            }`}
          >
            {publicationDateDisplay(publication.date)}
          </p>
        </div>
        <div className="publication-list-item-options-dropdown-container">
          {publication.showPinOption && (
            <ListItemOptionsDropdown
              resourceType={PUBLICATION}
              resourceID={publication.id}
              item={publication}
              pinProfileID={publication.pinProfileID}
              pinProfileCollection={publication.pinProfileCollection}
              options={[PIN]}
              backgroundShade={publication.backgroundShade}
            />
          )}
        </div>
      </div>
    </>
  );
}

export function publicationDateDisplay(date) {
  if (!date) return null;
  if (date.length > 10) return date.slice(0, 10);
  return date;
}
function PublicationListItemTitle({pathName, title, noLink, backgroundShade}) {
  const titleHeader = <h3>{title}</h3>;
  if (!pathName || noLink)
    return (
      <div
        className={`publication-list-item-title-${
          backgroundShade ? backgroundShade : 'light'
        }`}
      >
        {titleHeader}
      </div>
    );
  return (
    <Link
      to={pathName}
      className={`publication-list-item-title-${
        backgroundShade ? backgroundShade : 'light'
      }`}
    >
      {titleHeader}
    </Link>
  );
}

// the max number of authors to display at a time
const AUTHORS_DISPLAY_LIMIT = 3;

function PublicationListItemAuthors({authors, backgroundShade}) {
  if (!authors) return <></>;
  const uniqueAuthors = getUniqueAuthorsFromAuthors(authors);
  let authorsList;
  if (uniqueAuthors.length <= AUTHORS_DISPLAY_LIMIT) {
    authorsList = authorsToAuthorList(uniqueAuthors, backgroundShade);
  } else {
    authorsList = authorsToAuthorList(
      uniqueAuthors.slice(0, AUTHORS_DISPLAY_LIMIT),
      backgroundShade
    );
    const remainingCount = uniqueAuthors.length - AUTHORS_DISPLAY_LIMIT;
    authorsList.push(
      <h4 key="authors spill over">
        and {remainingCount} other{remainingCount > 1 ? 's' : ''}
      </h4>
    );
  }
  return (
    <div
      className={`publication-list-item-content-authors-${
        backgroundShade ? backgroundShade : LIGHT_NAME_SHADE
      }`}
    >
      {authorsList}
    </div>
  );
}

function authorsToAuthorList(authors, backgroundShade) {
  return authors.map((author, idx) => (
    <PublicationListItemAuthor
      ID={author.id}
      microsoftID={author.microsoftIDs[0]}
      name={author.name}
      key={author.microsoftIDs[0] + idx}
      first={idx === 0}
      last={idx === authors.length - 1}
      backgroundShade={backgroundShade}
    />
  ));
}

function PublicationListItemAuthor({
  id,
  microsoftID,
  name,
  first,
  last,
  backgroundShade,
}) {
  let nameStr;
  if (first && !last) {
    nameStr = `${name},`;
  } else if (first && last) {
    nameStr = `${name}`;
  } else {
    nameStr = `and ${name}`;
  }
  const authorLink = getLinkForAuthor(
    id,
    microsoftID,
    nameStr,
    backgroundShade
  );
  return (
    <h4 className="publication-list-item-content-author">{authorLink}&nbsp;</h4>
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
