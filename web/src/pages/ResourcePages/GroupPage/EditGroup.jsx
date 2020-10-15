import React, {useState} from 'react';
import EditGroupInfo from './EditGroupInfo';
import EditGroupPosts from './EditGroupPosts';

import './GroupPage.css';

export default function EditGroup({groupData, setEditingGroup}) {
  const tabs = ['Info', 'Posts'];
  const [editType, setEditType] = useState(tabs[0]);
  if (editType === tabs[0])
    return (
      <div className="content-layout">
        <div className="group-details">
          <EditGroupTabs
            editType={editType}
            tabs={tabs}
            setEditType={setEditType}
          />
          <div className="edit-group-posts-cancel">
            <button onClick={() => setEditingGroup(false)}>
              <h4>Back to Group Page</h4>
            </button>
          </div>
          <EditGroupInfo
            groupData={groupData}
            setEditingGroup={setEditingGroup}
          />
        </div>
      </div>
    );
  if (editType === tabs[1])
    return (
      <>
        <EditGroupPosts
          groupData={groupData}
          setEditingGroup={setEditingGroup}
          tabs={tabs}
          setEditType={setEditType}
          editType={editType}
        />
      </>
    );
  else return null;
}

export function EditGroupTabs({editType, tabs, setEditType}) {
  return (
    <div className="edit-group-tabs-container">
      <button
        onClick={() => {
          if (editType !== tabs[0]) setEditType(tabs[0]);
        }}
      >
        <h2
          className={
            editType === tabs[0]
              ? 'edit-group-tab-active'
              : 'edit-group-tab-inactive'
          }
        >
          {tabs[0]}
        </h2>
      </button>
      <button
        onClick={() => {
          if (editType !== tabs[1]) setEditType(tabs[1]);
        }}
      >
        <h2
          className={
            editType === tabs[1]
              ? 'edit-group-tab-active'
              : 'edit-group-tab-inactive'
          }
        >
          {tabs[1]}
        </h2>
      </button>
    </div>
  );
}
