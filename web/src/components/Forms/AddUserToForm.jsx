import {Form, Formik} from 'formik';
import React from 'react';
import {SearchIconGrey} from '../../assets/HeaderIcons';
import {EmailIcon} from '../../assets/PostOptionalTagsIcons';
import CancelButton from '../Buttons/CancelButton';
import TabbedContainer from '../TabbedContainer/TabbedContainer';
import {UserSmallResultItem} from '../User/UserListItem';
import FormTextInput from './FormTextInput';
import {
  InstantSearch,
  SearchBox,
  Hits,
  Configure,
  connectStateResults,
} from 'react-instantsearch-dom';
import {useLocation} from 'react-router-dom';
import {searchClient} from '../../algolia';
import {abbrEnv} from '../../config';
import * as Yup from 'yup';
import CreateResourceFormActions from './CreateResourceFormActions';

import './AddUserToForm.css';

export default function AddMemberContainer({addSelectedUsers, setSelecting}) {
  const selectUserAndStopSelecting = (user) => {
    addSelectedUsers(user);
    setSelecting(false);
  };

  const tabDetails = [
    {
      name: 'Search on Labspoon',
      icon: <SearchIconGrey />,
      contents: (
        <AddMemberSearch
          setSelecting={setSelecting}
          hasCancel={true}
          onUserSelect={selectUserAndStopSelecting}
        />
      ),
    },
    {
      name: 'Invite By Email',
      icon: <EmailIcon />,
      contents: (
        <AddMemberByEmail
          addSelectedUsers={addSelectedUsers}
          setSelecting={setSelecting}
        />
      ),
    },
  ];

  return <TabbedContainer tabDetails={tabDetails} />;
}

const NoQueryNoResults = connectStateResults(({searchState, children}) => {
  if (!searchState.query) return <></>;
  return children;
});

function AddMemberByEmail({addSelectedUsers, setSelecting}) {
  const validationSchema = Yup.object({
    email: Yup.string().email().required('Email required'),
  });
  function onSubmit(res) {
    addSelectedUsers({
      email: res.email,
    });
    setSelecting(false);
  }
  const pathname = useLocation().pathname;

  return (
    <>
      <Formik
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        initialValues={{
          email: '',
        }}
      >
        <Form id="email-form">
          <FormTextInput name="email" sideLabel />
        </Form>
      </Formik>
      <CreateResourceFormActions
        submitText="Add"
        cancelForm={() => setSelecting(false)}
        formID="email-form"
        noBorder={true}
      />

      <p className="create-group-invite-email-info">
        The invite will only be sent once you have{' '}
        {pathname.includes('create')
          ? 'created your group'
          : 'saved your changes'}
      </p>
    </>
  );
}

export function AddMemberSearch({setSelecting, hasCancel, onUserSelect}) {
  // TODO: when a user has been selected their entry in the search results should be greyed out
  return (
    <>
      <div className="create-group-member-search">
        <InstantSearch
          searchClient={searchClient}
          indexName={abbrEnv + '_USERS'}
        >
          <div className="add-user-to-form-instant-search-searchbox-container">
            <SearchBox />
          </div>
          <NoQueryNoResults>
            <Hits
              hitComponent={({hit}) => {
                return (
                  <UserSmallResultItem
                    user={hit}
                    selectUser={onUserSelect}
                    key={hit.id + 'user'}
                  />
                );
              }}
            />
          </NoQueryNoResults>
          <Configure hitsPerPage={10} />
        </InstantSearch>
      </div>
      {hasCancel && <CancelButton cancelAction={() => setSelecting(false)} />}
    </>
  );
}

export function FindAndAddUsersToForm({onUserSelect, searchBarLabel}) {
  return (
    <div className="find-and-add-users-to-form-container">
      <h4 className="find-and-add-users-to-form-title">
        {searchBarLabel ? searchBarLabel : 'Find and add users'}
      </h4>
      <AddMemberSearch onUserSelect={onUserSelect} />
    </div>
  );
}
