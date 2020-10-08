import React, {useState, useEffect} from 'react';
import {getPaginatedUserReferencesFromCollectionRef} from '../../../helpers/users';
import FilterableResults, {
  NewFilterMenuWrapper,
  NewResultsWrapper,
} from '../../../components/FilterableResults/FilterableResults';
import {EditGroupTabs} from './EditGroup';
import {db} from '../../../firebase';

import './GroupPage.css';

export default function EditingGroupInfo({
  groupData,
  setEditingGroup,
  tabs,
  setEditType,
  editType,
}) {
  const [addOrRemove, setAddOrRemove] = useState('add');
  const groupID = groupData.id;
  const [groupMembers, setGroupMembers] = useState([]);
  const membersDBCollectionRef = db.collection(`groups/${groupID}/members`);

  useEffect(() => {}, [groupID]);
  // useEffect(() => {
  //   groupMembers.forEach((groupMember) => {
  //     const postsByMemberRef = db.collection(`users/${groupMember.id}/posts`);
  //     let last;
  //     getPaginatedPostsFromCollectionRef(groupMember.id, 11, last);
  //   });
  // }, [groupMembers]);

  console.log(groupMembers);
  const memberFilter = () => {
    const filterCollections = [];
    const filterCollection = {
      collectionName: 'Group Members',
      options: [],
      mutable: true,
    };

    getPaginatedUserReferencesFromCollectionRef(membersDBCollectionRef, 20)
      .then((fetchedMembers) => {
        if (Array.isArray(fetchedMembers)) setGroupMembers(fetchedMembers);

        fetchedMembers.forEach((fetchedGroupMember) => {
          filterCollection.options.push({
            data: {
              id: fetchedGroupMember.id,
              name: fetchedGroupMember.name,
            },
            enabled: false,
          });
        });
      })
      .catch((err) => console.log('filter err', err));
    filterCollections.push(filterCollection);
    return Promise.all(filterCollections);
  };

  const fetchPostsByMembers = () => [];
  return (
    <>
      <FilterableResults
        fetchResults={fetchPostsByMembers}
        limit={10}
        loadingFilter
      >
        <div className="sider-layout">
          <NewFilterMenuWrapper getDefaultFilter={memberFilter} />
        </div>
        <div className="content-layout">
          <div className="feed-container">
            <EditGroupTabs
              editType={editType}
              tabs={tabs}
              setEditType={setEditType}
            />
            <div className="edit-group-posts-add-or-remove-container">
              <div className="edit-group-posts-add-or-remove-button-container">
                <button
                  onClick={() => {
                    if (addOrRemove !== 'add') setAddOrRemove('add');
                  }}
                  buttonText=" Add posts"
                  className={
                    addOrRemove === 'add'
                      ? 'feed-tab-active'
                      : 'feed-tab-inactive'
                  }
                >
                  <h3>Add Posts</h3>
                </button>
              </div>
              <div className="edit-group-posts-add-or-remove-button-container">
                <button
                  onClick={() => {
                    if (addOrRemove !== 'remove') setAddOrRemove('remove');
                  }}
                  inactive={addOrRemove === 'remove' ? false : true}
                  className={
                    addOrRemove === 'remove'
                      ? 'feed-tab-active'
                      : 'feed-tab-inactive'
                  }
                >
                  <h3> Remove Posts</h3>
                </button>
              </div>
            </div>
            <NewResultsWrapper />
          </div>
        </div>
      </FilterableResults>
    </>
  );
}
