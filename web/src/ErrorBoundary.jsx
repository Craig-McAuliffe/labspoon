import React from 'react';
import errorIcon from './assets/errorIcon.svg';

import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return {hasError: true};
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    // TODO: report errors via sentry
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="error-container">
          <img
            style={{maxWidth: '20%', height: 'auto'}}
            src={errorIcon}
            alt="Bug fixing illustration"
          />
          <h2>
            Oops, something went wrong. Patrick and Craig personally apologise
            for the inconvenience.
          </h2>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
