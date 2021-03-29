import React, {useContext, useState} from 'react';
import {Link, useHistory} from 'react-router-dom';
import SearchBar, {MinimisedSearchBar} from '../../SearchBar';
import AvatarDropDown from './AvatarDropDown';
import HeaderLogo from '../../../assets/HeaderLogo';
import {HeaderCreateButton} from '../../Buttons/CreateButton';
import {DropDownTriangle, RemoveIcon} from '../../../assets/GeneralActionIcons';
import withSizes from 'react-sizes';
import './Header.css';
import {AuthContext} from '../../../App';
import Dropdown, {DropdownOption} from '../../Dropdown';

function Header({isMobile}) {
  if (isMobile) return <MobileHeader />;
  return <DesktopHeader />;
}

const mapSizesToProps = ({width}) => ({
  isMobile: width && width <= 500,
});

export default withSizes(mapSizesToProps)(Header);

function DesktopHeader() {
  return <HeaderComponents />;
}

function MobileHeader() {
  const [searching, setSearching] = useState(false);
  return (
    <>
      <HeaderComponents
        miniSearch={true}
        setExpandedSearch={setSearching}
        expandedSearch={searching}
      />
    </>
  );
}

function HeaderComponents({miniSearch, setExpandedSearch, expandedSearch}) {
  const {user} = useContext(AuthContext);
  const leftSection = () =>
    expandedSearch ? (
      <button onClick={() => setExpandedSearch(false)}>
        <RemoveIcon />
      </button>
    ) : (
      <Link to="/" className="header-home-link">
        <div className="header-logo">
          <HeaderLogo />
        </div>
      </Link>
    );

  const searchSection = () =>
    miniSearch ? (
      <MinimisedSearchBar
        onFocus={() => setExpandedSearch(true)}
        expanded={expandedSearch}
      />
    ) : (
      <SearchBar />
    );

  const rightSection = () =>
    expandedSearch ? (
      <div></div>
    ) : (
      <div className="header-right-section">
        <div className="header-add-button">
          {user ? <HeaderCreateButton /> : <KeyLinksDropdown />}
        </div>
        <div className="header-drop-down">
          <AvatarDropDown />
        </div>
      </div>
    );

  return (
    <div className="header-container">
      {leftSection()}
      {searchSection()}
      {rightSection()}
    </div>
  );
}

function KeyLinksDropdown() {
  const history = useHistory();
  const keyLinkOptions = [
    {name: 'Contact', link: '/contact'},
    {name: 'About us', link: '/aboutUs'},
    {name: 'Privacy policy', link: '/privacy-policy'},
    {name: 'Cookies Policy', link: '/cookies-policy'},
  ];
  const keyLinkOptionsDisplay = keyLinkOptions.map((option) => (
    <DropdownOption
      key={option.name}
      onSelect={() => history.replace(option.link)}
    >
      <span className="key-links-dropdown-option">{option.name}</span>
    </DropdownOption>
  ));
  return (
    <Dropdown
      customToggle={(onSelect) => (
        <KeyLinksDropDownToggle onSelect={onSelect} />
      )}
      customDropdownContainerWidth="140px"
      containerRightPosition="10px"
      containerTopPosition="12px"
    >
      {keyLinkOptionsDisplay}
    </Dropdown>
  );
}

function KeyLinksDropDownToggle({onSelect}) {
  return (
    <button onClick={onSelect} className="key-links-options-toggle-button">
      <DropDownTriangle />
    </button>
  );
}
