import {reCaptchaSiteKey, functionsHttpsUrl} from '../config';
import axios from 'axios';

export default async function reCaptcha(
  threshold,
  action,
  successFunction,
  failureFunction,
  errorFunction
) {
  return new Promise((resolve, reject) =>
    window.grecaptcha.ready(async () =>
      window.grecaptcha
        .execute(reCaptchaSiteKey, {action: action})
        .then(async (token) =>
          axios
            .get(`${functionsHttpsUrl}activity-recaptchaVerify?token=${token}`)
            .then(async (res) => {
              const score = res.data.score;
              if (score && score > threshold) {
                if (successFunction) await successFunction();
                return resolve(true);
              }
              if (failureFunction) return failureFunction(resolve);
            })
            .catch(async (err) => {
              console.error('recaptcha function call failed', err);
              if (errorFunction) return errorFunction();
              reject(err);
            })
        )
        .catch(async (err) => {
          console.error('unable to execute recaptcha', err);
          if (errorFunction) await errorFunction();
          reject(err);
        })
    )
  );
}
