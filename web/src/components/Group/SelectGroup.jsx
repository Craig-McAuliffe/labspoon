import React from 'react';
import Dropdown, {DropdownOption} from '../Dropdown';
import {GroupDropdownItem} from '../Group/GroupListItem';

export default function SelectGroup({
  groups,
  setSelectedGroup,
  toggleText,
  customToggle,
  loading,
}) {
  return (
    <Dropdown
      customToggle={customToggle}
      customToggleTextOnly={toggleText}
      loading={loading}
    >
      {getGroupOptions(groups, setSelectedGroup)}
    </Dropdown>
  );
}

export function getGroupOptions(groups, setSelectedGroup) {
  return groups.map((group) => (
    <DropdownOption
      key={group.id}
      onSelect={() => {
        setSelectedGroup(group);
      }}
    >
      <GroupDropdownItem group={group} />
    </DropdownOption>
  ));
}
