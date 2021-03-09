import React, {useContext} from 'react';
import {Link} from 'react-router-dom';
import {AuthContext} from '../../App';
import {CreateIcon} from '../../assets/HeaderIcons';
import OnboardingTip from '../OnboardingTips/OnboardingTip';
import {CREATE, SignUpPopoverOverride} from '../Popovers/Popover';
import './CreateButton.css';

export function HeaderCreateButton({hoverControl}) {
  const {user} = useContext(AuthContext);
  return (
    <>
      <SignUpPopoverOverride text="Sign up to create." actionTaken={CREATE}>
        <HeaderCreateButtonContent user={user} hoverControl={hoverControl} />
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
  'Create posts, groups, and articles. Share to your Twitter page.';

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

export default function CreateButton({link, buttonAction, text}) {
  if (buttonAction)
    return (
      <button className="create-button" onClick={buttonAction}>
        <CreateIcon hoverControl={true} />
        {text ? <h3>{text}</h3> : null}
      </button>
    );
  return (
    <Link to={link} className="create-button">
      <CreateIcon hoverControl={true} />
      {text ? <h3>{text}</h3> : null}
    </Link>
  );
}
