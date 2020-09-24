import firebase from 'firebase';
import 'firebase/auth';
import 'firebase/firestore';

import {abbrEnv} from './config';

const firebaseConfig = {
  apiKey: 'AIzaSyDfyZeoIcWLlTB61hpA_K5jr4i6VXX37D8',
  authDomain: 'labspoon-dev-266bc.firebaseapp.com',
  databaseURL: 'https://labspoon-dev-266bc.firebaseio.com',
  projectId: 'labspoon-dev-266bc',
  storageBucket: 'labspoon-dev-266bc.appspot.com',
  messagingSenderId: '23703499085',
  appId: '1:23703499085:web:8b34e7566809fcd71d4704',
  measurementId: 'G-TTJY6H2QC2',
};
firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();
if (abbrEnv == 'dev') {
  db.settings({
    host: 'localhost:8080',
    ssl: false,
  });
  firebase.functions().useFunctionsEmulator('http://localhost:5001');
}
export const projectURL = 'labspoon-dev-266bc.appspot.com';
export default firebase;
