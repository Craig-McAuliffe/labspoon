import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import Carousel from 'react-bootstrap/Carousel';
import {
  LabspoonLogoAndName,
  CustomUpdateFrequencyDiagram,
  CustomFeedDiagram,
  FromLabSpoonedToYouDiagram,
  SearchAndNetworkDiagram,
  BackGroundSweep,
} from '../../assets/AboutPageIcons';
import SearchBar from '../../components/SearchBar';

import PrimaryButton from '../../components/Buttons/PrimaryButton';

import './AboutPage.css';

export default function AboutPage() {
  return (
    <div className="about-page">
      <div className="about-page-background-sweep-container">
        <BackGroundSweep />
      </div>
      <div className="about-page-header">
        <div className="about-page-header-logo">
          <LabspoonLogoAndName />
        </div>
        <div className="about-page-header-actions">
          <Link to="/search?query=COVID%2019&page=1">
            <h3>Research News</h3>
          </Link>
          <Link to="/login">
            <PrimaryButton>Get Started</PrimaryButton>
          </Link>
        </div>
      </div>
      <div className="about-page-main-content">
        <div></div>
        <div>
          <div className="about-page-headline-section">
            <div className="about-page-headline-text-container">
              <p>For all curious people</p>
              <h1>Find and follow experts in any topic</h1>
              <h2>Hear straight from innovators</h2>
              <h2>Be the first to know about breakthroughs</h2>
              <h2>Share your expert opinion</h2>
            </div>
            <div className="about-page-headline-diagram-container">
              <FromLabSpoonedToYouDiagram />
            </div>
          </div>
          <div className="about-page-search-section">
            <p>I am interested in...</p>
            <SearchBar
              aboutPageSearch={true}
              placeholderText="Something you find fascinating"
            />
          </div>
          <div className="about-page-features-section">
            <div className="about-page-feature-left-container">
              <SearchAndNetworkDiagram />
            </div>
            <div className="about-page-feature-right-container">
              <h2>
                Discover the major researchers in a topic space with our natural
                language search engine and network of experts.
              </h2>
            </div>
            <div className="about-page-feature-left-container">
              <h2>
                Follow a topic space, a particular research group, or an
                individual for updates directly from the lab.
              </h2>
            </div>
            <div className="about-page-feature-right-container">
              <div className="about-page-carousel-container">
                <FeaturesCarousel />
              </div>
            </div>
            <div className="about-page-feature-left-container">
              <CustomUpdateFrequencyDiagram />
            </div>
            <div className="about-page-feature-right-container">
              <h2>
                Choose the types of updates you want and when you want them.
              </h2>
            </div>
            <div className="about-page-feature-left-container">
              <h2>
                Build your custom feeds with whatever mixture of topics you
                choose.
              </h2>
            </div>
            <div className="about-page-feature-right-container">
              <CustomFeedDiagram />
            </div>
          </div>
          <div className="about-page-final-actions-container">
            <Link to="/login">
              <PrimaryButton>Get Started</PrimaryButton>
            </Link>
          </div>
        </div>
        <div></div>
      </div>
    </div>
  );
}

function FeaturesCarousel() {
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
  };

  const nextSlideIcon = () => {
    return (
      <button
        className="about-page-carousel-next-icon-button"
        onClick={() => {
          setIndex(() => {
            if (index === 2) return 0;
            else return index + 1;
          });
        }}
      >
        <svg
          width="71"
          height="71"
          viewBox="8 0 71 71"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M32.5 3L64.999 35.499L32.499 67.999"
            stroke="#00507C"
            strokeWidth="8"
          />
        </svg>
      </button>
    );
  };
  return (
    <div className="about-page-carousel-section">
      {nextSlideIcon()}
      <Carousel activeIndex={index} onSelect={handleSelect}>
        <Carousel.Item interval={300} pause="hover" slide controls>
          <div className="about-page-carousel-item">
            <img
              className="d-block w-100"
              src="https://storage.cloud.google.com/labspoon-dev-266bc.appspot.com/marketing/user_profile_craig.png"
              alt="user profile on Labspoon"
            />
          </div>
        </Carousel.Item>
        <Carousel.Item interval={300} pause="hover" slide controls>
          <div className="about-page-carousel-item">
            <img
              className="d-block w-100"
              src="https://storage.cloud.google.com/labspoon-dev-266bc.appspot.com/marketing/group_page_labspoon.png"
              alt="Group page on Labspoon"
            />
          </div>
        </Carousel.Item>
        <Carousel.Item interval={300} pause="hover" slide controls>
          <div className="about-page-carousel-item">
            <img
              className="d-block w-100"
              src="https://storage.cloud.google.com/labspoon-dev-266bc.appspot.com/marketing/topic_page_plastic_waste.png"
              alt="Topic page on Labspoon"
            />
          </div>
        </Carousel.Item>
      </Carousel>
    </div>
  );
}
