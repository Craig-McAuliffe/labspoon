export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

export const projectURL = process.env.REACT_APP_FIREBASE_PROJECT_URL;

export const env = process.env.REACT_APP_ENV;
export const abbrEnv = env;

export const reCaptchaSiteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;
export const functionsHttpsUrl =
  process.env.REACT_APP_FIREBASE_FUNCTIONS_HTTPS_URL;
