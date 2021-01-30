import React, {useState, useContext, useEffect} from 'react';
import {PaddedPageContainer} from '../../components/Layout/Content';
import SecondaryButton from '../../components/Buttons/SecondaryButton';
import {Switch, Route, useRouteMatch, Link} from 'react-router-dom';
import HelpPage from './HelpPage';
import SomethingWrongPage from './SomethingWrongPage';
import SuggestionsPage from './SuggestionsPage';
import {Form, Formik} from 'formik';
import FormTextInput, {
  FormTextArea,
} from '../../components/Forms/FormTextInput';
import {AuthContext} from '../../App';
import * as Yup from 'yup';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import {db} from '../../firebase';
import SuccessMessage from '../../components/Forms/SuccessMessage';
import ErrorMessage from '../../components/Forms/ErrorMessage';
import {LoadingSpinnerPage} from '../../components/LoadingSpinner/LoadingSpinner';
import {BotDetector} from '../../App';

import './ContactPage.css';

export default function ContactPage() {
  const {path} = useRouteMatch();
  return (
    <Switch>
      <Route exact path={`${path}/help`}>
        <HelpPage />
      </Route>
      <Route exact path={`${path}/something-wrong`}>
        <SomethingWrongPage />
      </Route>
      <Route exact path={`${path}/suggestions`}>
        <SuggestionsPage />
      </Route>
      <Route path={`${path}`}>
        <ContactPageNavigation />
      </Route>
    </Switch>
  );
}

function ContactPageNavigation() {
  return (
    <PaddedPageContainer>
      <ContactPageNavigationLinks />
    </PaddedPageContainer>
  );
}

export function ContactPageNavigationLinks() {
  return (
    <div>
      <Link to="/contact/help">
        <SecondaryButton>Help</SecondaryButton>
      </Link>
      <Link to="/contact/something-wrong">
        <SecondaryButton>Something Wrong</SecondaryButton>
      </Link>
      <Link to="/contact/suggestions">
        <SecondaryButton>Feature Suggestions</SecondaryButton>
      </Link>
    </div>
  );
}

export function GenericContactPage({contactFormType, mainLabel, children}) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [honey, setHoney] = useState(false);
  const [humanMouseMovement, setHumanMouseMovement] = useState(false);
  const [previousMousePosition, setPreviousMousePosition] = useState([]);
  const [recaptchaRequired, setRecaptchaRequired] = useState(false);
  const [timeAtPageLoad, setTimeAtPageLoad] = useState();
  const [cachedSubmitData, setCachedSubmitData] = useState();
  const {setBotConfirmed} = useContext(BotDetector);
  const {user} = useContext(AuthContext);

  let typeSpecificMessage;
  let typeSpecificTitle;

  // if form is filled in too fast, it is a bot or spam
  useEffect(() => {
    setTimeAtPageLoad(new Date().getTime() / 1000);
  }, [user]);

  switch (contactFormType) {
    case 'help':
      typeSpecificMessage = 'We aim to get back to you within 3 working days.';
      typeSpecificTitle = 'Help';
      break;
    case 'somethingWrong':
      typeSpecificMessage =
        'We will look into the issue. If you provided us with an email, we will let you know when it is fixed.';
      typeSpecificTitle = 'Something Wrong';
      break;
    case 'suggestion':
      typeSpecificTitle = 'Feature Suggestions';
      break;
    default:
      return '';
  }

  const checkMouseMovement = (e) => {
    if (humanMouseMovement) return;
    const currentXPosition = e.pageX;
    const currentYPosition = e.pageY;

    if (previousMousePosition.length === 2) {
      const previousGradient =
        (previousMousePosition[1].y - previousMousePosition[0].y) /
        (previousMousePosition[1].x - previousMousePosition[0].x);
      const newGradient =
        (currentYPosition - previousMousePosition[1].y) /
        (currentXPosition - previousMousePosition[1].x);
      if (previousGradient !== newGradient) setHumanMouseMovement(true);
    }
    setPreviousMousePosition((previous) => {
      const newArray = [...previous];
      if (newArray.length === 2) newArray.shift();
      newArray.push({x: currentXPosition, y: currentYPosition});
      return newArray;
    });
  };

  const initialValues = {
    contactFormDescription: '',
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Must be a valid email address')
      .max(100, 'Too long. Must have fewer than 100 characters'),
    contactFormDescription: Yup.string()
      .required('You need to write something')
      .max(1000, 'Too long. Must have fewer than 1000 characters'),
  });

  const onSubmit = async (values, manuallyApproved) => {
    if (manuallyApproved !== true) {
      // bot trap
      if (
        honey ||
        !humanMouseMovement ||
        new Date().getTime() / 1000 - timeAtPageLoad < 3
      ) {
        setRecaptchaRequired(true);
        setCachedSubmitData(values);
        return;
      }
    }
    setSubmitting(true);
    const formDBRef = db
      .collection(`contactForms/${contactFormType}/submittedForms`)
      .doc();
    if (user) values.userID = user.uid;
    await formDBRef
      .set(values)
      .catch((err) => {
        console.error('unable to submit contact form', err);
        setSubmitting(false);
        setError(true);
      })
      .then(() => {
        setSuccess(true);
        setSubmitting(false);
      });
  };

  if (recaptchaRequired)
    return (
      <ContactFormRecaptcha
        setBotConfirmed={setBotConfirmed}
        cachedSubmitData={cachedSubmitData}
        onSubmit={onSubmit}
      />
    );
  if (submitting) return <LoadingSpinnerPage />;
  if (success)
    return <ContactFormSuccess typeSpecificMessage={typeSpecificMessage} />;

  return (
    <PaddedPageContainer>
      <div
        className="contact-page-mouse-movement-detection"
        onMouseMove={checkMouseMovement}
      >
        <ContactPageNavigationLinks />
        {error && (
          <div className="contact-page-error-message-container">
            <ErrorMessage>Something went wrong. Please try again.</ErrorMessage>
          </div>
        )}
        <div>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            <Form>
              <label className="contact-page-username-label">
                UserName. Please leave this empty.
                <input
                  className="contact-page-username-input"
                  name="userName"
                  onChange={() => setHoney(true)}
                />
              </label>
              <label className="contact-page-location-label">
                Please leave this empty.
                <input
                  className="contact-page-location-input"
                  name="location"
                  onChange={() => setHoney(true)}
                />
              </label>
              <h2 className="contact-page-title">{typeSpecificTitle}</h2>
              <p>
                {children}
                {contactFormType === 'suggestion' && (
                  <Link to="/contact/something-wrong">this page instead.</Link>
                )}
              </p>
              <FormTextArea
                height="200px"
                label={mainLabel}
                name="contactFormDescription"
              />
              {contactFormType !== 'suggestion' && (
                <FormTextInput label="Your Email" name="email" />
              )}
              <div className="contact-page-submit-container">
                <PrimaryButton type="submit">Send Suggestion</PrimaryButton>
              </div>
            </Form>
          </Formik>
        </div>
      </div>
    </PaddedPageContainer>
  );
}

function ContactFormSuccess({typeSpecificMessage}) {
  return (
    <PaddedPageContainer>
      <SuccessMessage>Message received! {typeSpecificMessage}</SuccessMessage>
      <Link to="/">
        <h3 className="contact-page-success-back">Back to the home page</h3>
      </Link>
    </PaddedPageContainer>
  );
}

function ContactFormRecaptcha({setBotConfirmed, cachedSubmitData, onSubmit}) {
  return (
    <PaddedPageContainer>
      <h4>Recaptcha</h4>Are sensors indicate that you might be a bot. Bots are
      not allowed to contact us. Are you a bot?
      <div>
        <button
          onClick={() => setBotConfirmed(true)}
          className="not-a-human-button"
        >
          Yes I am a bot
        </button>{' '}
        <button
          onClick={() => onSubmit(cachedSubmitData, true)}
          className="not-a-bot-button"
        >
          No, I am not a bot
        </button>
      </div>
    </PaddedPageContainer>
  );
}
