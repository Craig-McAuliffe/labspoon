import React, {useState} from 'react';
import EditGroupInfo from './EditGroupInfo';
import EditGroupPosts from './EditGroupPosts';
import EditGroupPublications from './EditGroupPublications';
import EditGroupPhotos from './EditGroupPhotos';

import './GroupPage.css';

export default function EditGroup({groupData, setEditingGroup}) {
  const tabs = ['Info', 'Posts', 'Publications', 'Photos'];
  const [editType, setEditType] = useState(tabs[0]);
  switch (editType) {
    case tabs[0]:
      return (
        <div className="content-layout">
          <div className="group-details">
            <EditGroupTabs
              editType={editType}
              tabs={tabs}
              setEditType={setEditType}
            />
            <ReturnToGroupPageButton setEditingGroup={setEditingGroup} />
            <EditGroupInfo
              groupData={groupData}
              setEditingGroup={setEditingGroup}
            />
          </div>
        </div>
      );
    case tabs[1]:
      return (
        <EditGroupPosts groupID={groupData.id}>
          <EditGroupTabs
            editType={editType}
            tabs={tabs}
            setEditType={setEditType}
          />
          <ReturnToGroupPageButton setEditingGroup={setEditingGroup} />
        </EditGroupPosts>
      );
    case tabs[2]:
      return (
        <EditGroupPublications groupID={groupData.id}>
          <EditGroupTabs
            editType={editType}
            tabs={tabs}
            setEditType={setEditType}
          />
          <ReturnToGroupPageButton setEditingGroup={setEditingGroup} />
        </EditGroupPublications>
      );
    case tabs[3]:
      return (
        <EditGroupPhotos>
          <EditGroupTabs
            editType={editType}
            tabs={tabs}
            setEditType={setEditType}
          />
          <ReturnToGroupPageButton setEditingGroup={setEditingGroup} />
        </EditGroupPhotos>
      );
    default:
      return <></>;
  }
}

function ReturnToGroupPageButton({setEditingGroup}) {
  return (
    <div className="edit-group-posts-cancel">
      <button onClick={() => setEditingGroup(false)}>
        <h4>Back to Public View</h4>
      </button>
    </div>
  );
}

export function EditGroupTabs({editType, tabs, setEditType}) {
  return tabs.map((tab) => (
    <EditGroupTab
      key={tab}
      value={tab}
      onClick={() => {
        if (editType !== tab) setEditType(tab);
      }}
      active={editType === tab}
    />
  ));
}

function EditGroupTab({value, onClick, active}) {
  return (
    <button onClick={onClick}>
      <h2
        className={active ? 'edit-group-tab-active' : 'edit-group-tab-inactive'}
      >
        {value}
      </h2>
    </button>
  );
}
