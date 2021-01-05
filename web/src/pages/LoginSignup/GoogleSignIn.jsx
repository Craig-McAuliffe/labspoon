import {useEffect, useState} from 'react';
import {googleAuthProvider, auth, db} from '../../firebase.js';
import {createUserDocOnSignUp} from '../../helpers/users.js';

export default function GoogleSignIn({updateUserDetails, setLoading}) {
  const [signInCompleted, setSignInCompleted] = useState(false);

  useEffect(() => {
    if (signInCompleted) return;
    let isMounted = true;

    triggerGoogleSignInPopup()
      .then(async (result) => {
        if (!isMounted) return;
        setSignInCompleted(true);
        await db
          .doc(`users/${result.user.uid}`)
          .get()
          .then((ds) => {
            if (ds.exists) return;
            createUserDocOnSignUp(result, setLoading, '', updateUserDetails);
          })
          .catch((err) => {
            console.error(err);
            alert(
              'We could not verify if you email address is already linked to an account. Please email help@labspoon.com from the google email address with which you are trying to sign up.'
            );
          });
      })
      .catch((err) => {
        console.log(err.code, err.message, err.email);
        if ((err.code = 'auth/popup-closed-by-user')) return;
        if (err.code)
          alert(
            'Something went wrong while trying to sign you in with google. Please try again.'
          );
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setLoading]);
  return null;
}

async function triggerGoogleSignInPopup() {
  return await auth.signInWithPopup(googleAuthProvider);
}
