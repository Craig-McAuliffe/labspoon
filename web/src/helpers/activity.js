import {reCaptchaSiteKey, functionsHttpsUrl} from '../config';
import axios from 'axios';

export default function reCaptcha(
  threshold,
  action,
  successFunction,
  failureFunction,
  errorFunction
) {
  return window.grecaptcha.ready(async () =>
    window.grecaptcha
      .execute(reCaptchaSiteKey, {action: action})
      .then(async (token) =>
        axios
          .get(`${functionsHttpsUrl}activity-recaptchaVerify?token=${token}`)
          .then((res) => {
            const score = res.data.score;
            console.log(score);
            if (score && score > threshold) {
              if (successFunction) successFunction();
              return;
            }
            if (failureFunction) failureFunction();
          })
          .catch((err) => {
            console.error('recaptcha function call failed', err);
            if (errorFunction) errorFunction();
          })
      )
      .catch((err) => {
        if (errorFunction) errorFunction();
        console.error('unable to execute recaptcha', err);
      })
  );
}
