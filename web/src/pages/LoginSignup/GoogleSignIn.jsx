import {useEffect} from 'react';
import {googleAuthProvider, auth, db} from '../../firebase.js';
import {createUserDocOnSignUp} from '../../helpers/users.js';
import {claimGroupFromTwitter} from './SignupPage/SignupPage.jsx';

export default function GoogleSignIn({
  updateUserDetails,
  setLoading,
  setGoogleSignInFlow,
  claimGroupID,
  setIsSigningUp,
}) {
  useEffect(() => {
    setIsSigningUp(true);

    triggerGoogleSignInPopup()
      .then(async (result) => {
        await db
          .doc(`users/${result.user.uid}`)
          .get()
          .then(async (ds) => {
            if (!ds.exists) {
              await createUserDocOnSignUp(
                result,
                undefined,
                '',
                updateUserDetails
              );
            }
            if (claimGroupID) {
              await claimGroupFromTwitter(
                claimGroupID,
                result.user.displayName,
                result.user.uid
              );
            }
            setIsSigningUp(false);
            setGoogleSignInFlow(false);
          })
          .catch((err) => {
            console.error(err);
            alert(
              'We could not verify if you email address is already linked to an account. Please email help@labspoon.com from the google email address with which you are trying to sign up.'
            );
            setIsSigningUp(false);
            setGoogleSignInFlow(false);
          });
      })
      .catch((err) => {
        console.log(err.code, err.message, err.email);
        if ((err.code = 'auth/popup-closed-by-user')) {
          setIsSigningUp(false);
          setGoogleSignInFlow(false);
          return;
        }
        if (err.code)
          alert(
            'Something went wrong while trying to sign you in with google. Please try again.'
          );
        setIsSigningUp(false);
        setGoogleSignInFlow(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setLoading]);
  return null;
}

async function triggerGoogleSignInPopup() {
  return await auth.signInWithPopup(googleAuthProvider);
}
