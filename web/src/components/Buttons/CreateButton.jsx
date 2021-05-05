import React, {useContext} from 'react';
import {Link} from 'react-router-dom';
import {AuthContext} from '../../App';
import {CreateIcon} from '../../assets/HeaderIcons';
import OnboardingTip from '../OnboardingTips/OnboardingTip';
import {CREATE, SignUpPopoverOverride} from '../Popovers/Popover';
import './CreateButton.css';

export function HeaderCreateButton() {
  const {user} = useContext(AuthContext);
  return (
    <>
      <SignUpPopoverOverride text="Sign up to create." actionTaken={CREATE}>
        <HeaderCreateButtonContent user={user} />
      </SignUpPopoverOverride>
      {user ? (
        <OnboardingTip
          text={OnboardingCreateTipText}
          onboardingCheckFieldName="checkedCreateOnboardingTip"
        />
      ) : null}
    </>
  );
}

const OnboardingCreateTipText =
  'Got something to say? Create posts and more here.';

function HeaderCreateButtonContent({createAction, user}) {
  if (!user)
    return (
      <button className="header-create-button-link" onClick={createAction}>
        <CreateIcon hoverControl={true} />
        <h3>Create</h3>
      </button>
    );
  return (
    <Link className="header-create-button-link" to={'/create'}>
      <CreateIcon hoverControl={true} />
      <h3>Create</h3>
    </Link>
  );
}

export default function CreateButton({link, buttonAction, text}) {
  if (buttonAction)
    return (
      <button className="create-button" onClick={buttonAction}>
        <CreateIcon hoverControl={true} />
        {text ? <h3>{text}</h3> : null}
      </button>
    );
  if (link)
    return (
      <Link to={link} className="create-button">
        <CreateIcon hoverControl={true} />
        {text ? <h3>{text}</h3> : null}
      </Link>
    );
  if (!buttonAction && !link)
    return (
      <div className="create-button">
        <CreateIcon hoverControl={true} />
        {text ? <h3>{text}</h3> : null}
      </div>
    );
}
