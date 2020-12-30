import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import SearchBar, {MinimisedSearchBar} from '../../SearchBar';
import AvatarDropDown from './AvatarDropDown';
import HeaderLogo from '../../../assets/HeaderLogo';
import {HeaderCreateButton} from '../../Buttons/CreateButton';
import {RemoveIcon} from '../../../assets/GeneralActionIcons';
import withSizes from 'react-sizes';
import './Header.css';

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
          <HeaderCreateButton />
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
