import React from 'react';
import {Link} from 'react-router-dom';
import {PaddedPageContainer} from '../../components/Layout/Content';

import './AboutUsPage.css';

export default function AboutUsPage() {
  return (
    <PaddedPageContainer>
      <div className="about-us-page-container">
        <h1>About us</h1>
        <h4>Founded by Craig McAuliffe and Patrick Leask</h4>
        <h2>Why we made Labspoon</h2>
        <p>
          We both wanted a way to easily stay up to date with research, to find
          all the active labs in a given topic and follow them for updates.
          There was nowhere that sufficiently allowed us to do that.
        </p>
        <p>
          At the same time, researchers told us about the issues with
          recruitment, staying up to date, finding collaborators, engaging the
          public, and more. We also noticed that group websites were difficult
          to find and varied wildly in quality. We hope that Labspoon can make
          all of these things, and more, easier.
        </p>
        <h2>Where Labspoon is going</h2>
        <p>
          Chief among the complaints we hear from researchers is that the
          current way in which research is disseminated and funded is
          inefficient, nay broken. We want to change this.
        </p>
        <p>
          We also want to make it much easier to analyse the state of the art of
          any field, how fields overlap, and where the next breakthrough might
          come from.
        </p>
        <h2>How Labspoon is funded</h2>
        <p>
          Labspoon is free to use. We therefore will generate income through
          adverts. Based on what topics our users follow and talk about, we will
          show them content that might be of interest to them. Any intelligence
          we get about a user is completely transparent. Anyone can see it. It
          is literally in the list of topics that they follow and post about.
        </p>
        <h2>A new kind of social media (hopefully)</h2>
        <p>
          We don&#39;t particularly like social media. Labspoon is designed
          primarily as a broadcasting tool. Those experts in a field can
          broadcast their work and opinions to their followers. We encourage
          discussion, of course, but the vast majority of our users come to
          Labspoon for quick updates on research, not to drain endless hours
          scrolling.
        </p>
        <br />
        <p>
          On Labspoon, you should be able to type in a topic, find all the
          relevant experts in the field, set up precise following, and be
          notified when there are updates. You should not have to wade through
          reams of irrelevant posts and content designed to keep you on the site
          against your own best interests. That is the goal.
        </p>
        <br />
        <h4>
          We hope you find the site useful. Feel free to reach out with any
          ideas through the{' '}
          <b>
            <Link to="/contact">contact page</Link>
          </b>{' '}
          or connect with Craig on linkedIN. All the best.
        </h4>
      </div>
    </PaddedPageContainer>
  );
}
