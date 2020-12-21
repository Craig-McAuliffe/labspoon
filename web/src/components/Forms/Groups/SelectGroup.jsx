import React from 'react';
import {Link} from 'react-router-dom';
import SecondaryButton from '../../Buttons/SecondaryButton';
import {SmallDropdownToggle} from '../../Dropdown';
import SelectGroup from '../../Group/SelectGroup';
import {GroupHeadlineItem} from '../../Group/GroupListItem';
import './SelectGroup.css';
import {CreateIcon} from '../../../assets/HeaderIcons';

export function SelectGroupLabel({fieldName, children}) {
  return (
    <div className="select-group-field-container">
      <h4 className="select-group-field-label">{fieldName}</h4>
      {children}
    </div>
  );
}

export function MustSelectGroup({userHasGroups, explanation}) {
  return (
    <div className="must-select-group-container">
      <Explanation>{explanation}</Explanation>
      {userHasGroups ? (
        <Explanation>Select one of your groups above.</Explanation>
      ) : (
        <>
          <div className="must-select-group-button-container">
            <Link to="/create">
              <SecondaryButton>
                <CreateIcon hoverControl={true} />
                Create Group Now
              </SecondaryButton>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function Explanation({children}) {
  return <h3 className="must-select-group-explanation">{children}</h3>;
}

export function SelectedGroup({selectedGroup, setSelectedGroup, groups}) {
  return (
    <div className="change-group-section">
      {groups.length > 1 ? (
        <div className="change-mandatory-group-dropdown-container">
          <SelectGroup
            groups={groups}
            setSelectedGroup={setSelectedGroup}
            customToggle={({setOpen}) => (
              <SmallDropdownToggle setOpen={setOpen} text="Change Group" />
            )}
          />
        </div>
      ) : null}
      <div>
        <GroupHeadlineItem group={selectedGroup} />
      </div>
    </div>
  );
}
