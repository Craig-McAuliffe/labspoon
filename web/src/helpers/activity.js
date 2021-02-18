import {reCaptchaSiteKey, functionsHttpsUrl} from '../config';
import axios from 'axios';

export default function reCaptcha(
  threshold,
  successFunction,
  failureFunction,
  errorFunction
) {
  return window.grecaptcha.ready(async () =>
    window.grecaptcha
      .execute(reCaptchaSiteKey, {action: 'sign_up'})
      .then(async (token) =>
        axios
          .get(`${functionsHttpsUrl}activity-recaptchaVerify?token=${token}`)
          .then((res) => {
            const score = res.data.score;
            if (score && score > threshold) {
              successFunction();
              return;
            }
            failureFunction();
          })
          .catch((err) => {
            console.error('recaptcha function call failed', err);
            errorFunction();
          })
      )
      .catch((err) => {
        errorFunction();
        console.error('unable to execute recaptcha', err);
      })
  );
}
