import firebase from 'firebase';
import 'firebase/auth';
import 'firebase/firestore';

import {firebaseConfig, abbrEnv} from './config';

firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
export const db = firebase.firestore();
export const storage = firebase.storage();
if (abbrEnv === 'local') {
  db.settings({
    host: 'localhost:8080',
    ssl: false,
  });
  firebase.functions().useFunctionsEmulator('http://localhost:5001');
}
export default firebase;
