import React, {useContext} from 'react';
import {Link} from 'react-router-dom';
import {AuthContext} from '../../App';
import {CreateIcon} from '../../assets/HeaderIcons';
import {CREATE, SignUpPopoverOverride} from '../Popovers/Popover';
import './CreateButton.css';

export function HeaderCreateButton({hoverControl}) {
  const {user} = useContext(AuthContext);
  return (
    <SignUpPopoverOverride text="Sign up to create." actionTaken={CREATE}>
      <HeaderCreateButtonContent user={user} hoverControl={hoverControl} />
    </SignUpPopoverOverride>
  );
}

function HeaderCreateButtonContent({createAction, user, hoverControl}) {
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

export default function CreateButton({link, text}) {
  return (
    <Link to={link} className="create-button">
      <CreateIcon hoverControl={true} />
      {text ? <h3>{text}</h3> : null}
    </Link>
  );
}
