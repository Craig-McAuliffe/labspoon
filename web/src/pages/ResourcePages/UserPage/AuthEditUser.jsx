import React, {useContext} from 'react';
import {Redirect, useParams} from 'react-router-dom';
import {AuthContext} from '../../../App';
import {LoadingSpinnerPage} from '../../../components/LoadingSpinner/LoadingSpinner';

export default function AuthEditUser({children}) {
  const userID = useParams().userID;
  const {user, authLoaded} = useContext(AuthContext);
  if (!authLoaded) return <LoadingSpinnerPage />;
  if (authLoaded && (!user || user.uid !== userID)) return <Redirect to="/" />;
  return children;
}
