import React, {useEffect, useState} from 'react';
import {useHistory, useParams, Link} from 'react-router-dom';
import ListItemTopics from '../../../components/ListItem/ListItemTopics';
import GeneralError from '../../../components/GeneralError';
import FollowGroupButton from '../../../components/Group/FollowGroupButton';
import GroupListItem from '../../../components/Group/GroupListItem';
import {PaddedPageContainer} from '../../../components/Layout/Content';
import {LoadingSpinnerPage} from '../../../components/LoadingSpinner/LoadingSpinner';
import {db} from '../../../firebase';

import './OpenPositionPage.css';
import NotFoundPage from '../../NotFoundPage/NotFoundPage';
import {RichTextBody} from '../../../components/Article/Article';

export default function OpenPositionPage() {
  const [openPosition, setOpenPosition] = useState();
  const [pageError, setPageError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const openPositionID = useParams().openPositionID;
  const history = useHistory();

  useEffect(() => {
    setLoading(true);
    if (!openPositionID) {
      setNotFound(true);
      return;
    }
    db.doc(`openPositions/${openPositionID}`)
      .get()
      .then((ds) => {
        setLoading(false);
        if (!ds.exists) {
          setNotFound(true);
        }
        setOpenPosition(ds.data());
      })
      .catch((err) => {
        setLoading(false);
        console.error('unable to retrieve open position from db' + err);
        setPageError(true);
      });
  }, [openPositionID, history]);

  if (pageError) return <GeneralError />;
  if (notFound) return <NotFoundPage />;
  if (!openPosition || loading) return <LoadingSpinnerPage />;
  return (
    <PaddedPageContainer>
      <h2>{openPosition.content.title}</h2>
      <h3 className="open-position-headline-section-institution">
        {openPosition.group.institution}
      </h3>
      {openPosition.content.salary && openPosition.content.salary.length > 0 ? (
        <div className="open-position-headline-sub-title-container">
          <h4 className="open-position-headline-sub-title">Salary</h4>
          <h4 className="open-position-headline-sub-title-value">
            {openPosition.content.salary}
          </h4>
        </div>
      ) : null}
      {openPosition.content.startDate &&
      openPosition.content.startDate.length > 0 ? (
        <div className="open-position-headline-sub-title-container">
          <h4 className="open-position-headline-sub-title">Start Date</h4>
          <h4 className="open-position-headline-sub-title-value">
            {openPosition.content.startDate}
          </h4>
        </div>
      ) : null}
      {openPosition.topics && openPosition.topics.length > 0 ? (
        <>
          <ListItemTopics
            dbTopics={openPosition.topics}
            customTopics={openPosition.customTopics}
          />
        </>
      ) : null}
      <div>
        {openPosition.content.address &&
          openPosition.content.address.length > 0 && (
            <div style={{marginTop: '20px'}}>
              <h4 className="open-position-headline-sub-title">Address</h4>
              <h4 className="open-position-headline-address">
                {openPosition.content.address}
              </h4>
            </div>
          )}
      </div>
      <h4 className="open-position-section-title">Affiliated Research Group</h4>
      <GroupListItem group={openPosition.group} noBorder={true}>
        <FollowGroupButton targetGroup={openPosition.group} />
      </GroupListItem>
      <div className="open-position-description-container">
        <h4 className="open-position-section-title">Description of Role</h4>
        <RichTextBody
          body={openPosition.content.description}
          expandable={true}
          id={openPosition.id}
        />
      </div>
      <h3 className="open-position-apply-title">
        Apply
        <span>
          {openPosition.content.applyEmail &&
          openPosition.content.applyEmail.length > 0 ? (
            <a href={`mailto:${openPosition.content.applyEmail}`}>
              {openPosition.content.applyEmail}
            </a>
          ) : (
            <a
              target="_blank"
              href={openPosition.content.applyLink}
              rel="noopener noreferrer"
            >
              {openPosition.content.applyLink}
            </a>
          )}
        </span>
      </h3>
      <div className="open-position-apply-container">
        <p className="open-position-created-by">Created By</p>
        <Link
          to={`/user/${openPosition.author.id}`}
          className="open-position-created-by-name"
        >
          {openPosition.author.name}
        </Link>
      </div>
    </PaddedPageContainer>
  );
}
