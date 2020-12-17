import React, {useContext} from 'react';
import {Link} from 'react-router-dom';
import {AuthContext} from '../../App';
import {CreateIcon} from '../../assets/HeaderIcons';
import {CREATE, SignUpPopoverOverride} from '../Popovers/Popover';

export default function CreateButton({hoverControl}) {
  const {user} = useContext(AuthContext);
  return (
    <SignUpPopoverOverride text="Sign up to create." actionTaken={CREATE}>
      <CreateButtonContent user={user} hoverControl={hoverControl} />
    </SignUpPopoverOverride>
  );
}

function CreateButtonContent({createAction, user, hoverControl}) {
  if (!user)
    return (
      <button onClick={createAction}>
        <CreateIcon hoverControl={hoverControl} />
      </button>
    );
  return (
    <Link to={'/create'}>
      <CreateIcon hoverControl={hoverControl} />
    </Link>
  );
}
