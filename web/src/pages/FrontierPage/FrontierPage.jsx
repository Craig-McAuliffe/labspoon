import React from 'react';
import {Link} from 'react-router-dom';
import HomePageTabs from '../../components/HomePageTabs';
import FilterableResults, {
  NewResultsWrapper,
} from '../../components/FilterableResults/FilterableResults';
import {getTestPosts} from '../../mockdata/posts';
import UserAvatar from '../../components/Avatar/UserAvatar';
import {
  Home,
  Agriculture,
  Biology,
  Economics,
  Chemistry,
  Computing,
  Earth,
  Engineering,
  Maths,
  Physics,
  Social,
} from '../../assets/FrontierSideMenuIcons';

import './FrontierPage.css';

export default function FrontierPage() {
  const fetchFeedData = () => {
    return getTestPosts();
  };

  const topTenPosts = getTestPosts().slice(0, 11);

  return (
    <>
      <div className="sider-layout">
        <div className="frontier-sider-items-container">
          <Home />
          <Link>Home</Link>
          <Agriculture />
          <Link>Agriculture & Ecology</Link>
          <Biology />
          <Link>Biology & Human Health</Link>
          <Economics />
          <Link>Business & Economics</Link>
          <Chemistry />
          <Link>Chemistry & Materials</Link>
          <Computing />
          <Link>Agriculture & Ecology</Link>
          <Earth />
          <Link>Earth & Atmospheric</Link>
          <Engineering />
          <Link>Engineering</Link>
          <Maths />
          <Link>Maths</Link>
          <Physics />
          <Link>Physics</Link>
          <Social />
          <Link>Social & Behavioural</Link>
        </div>
      </div>
      <div className="content-layout">
        <div className="feed-container">
          <HomePageTabs />
          <div className="frontier-page-highlights-container">
            <div className="frontier-page-headline-item-container">
              <HeadlineArticle article={topTenPosts[0]} />
            </div>
            <div className="frontier-page-secondary-tertiary-items-container">
              <SecondaryArticle article={topTenPosts[1]} />
              <div className="frontier-page-tertiary-articles-container">
                <TertiaryArticles articles={topTenPosts.slice(2, 5)} />
              </div>
            </div>
            <div className="frontier-page-quaternary-items-container">
              <QuaternaryArticles articles={topTenPosts.slice(5, 11)} />
            </div>
          </div>
          <div className="frontier-page-feed">
            <FilterableResults fetchResults={fetchFeedData} limit={10}>
              <NewResultsWrapper />
            </FilterableResults>
          </div>
        </div>
      </div>
    </>
  );
}

function HeadlineArticle({article}) {
  return (
    <div className="frontier-page-headline-item-header">
      <div className="frontier-headline-article-author-container">
        <Link
          to={`/user/${article.author.id}`}
          className="frontier-article-author-link"
        >
          <div className="frontier-headline-article-avatar-container">
            <UserAvatar src={article.author.avatar} height="80" width="80" />
          </div>
          <h4 className="frontier-headline-article-author-name">
            {article.author.name}
          </h4>
        </Link>
        <p className="frontier-headline-article-date">{article.createdAt}</p>
      </div>
      <div>
        <Link to={`/post/${article.id}`}>
          <h3>{article.title}</h3>
        </Link>
        <p>{article.content.text}</p>
      </div>
    </div>
  );
}

function SecondaryArticle({article}) {
  return (
    <div className="frontier-page-secondary-article">
      <div className="frontier-page-secondary-article-text">
        <Link to={`/post/${article.id}`}>
          <h4>{article.title}</h4>
        </Link>
        <p>{article.content.text}</p>
      </div>
      <div className="frontier-secondary-article-author-attributes">
        <Link to={`/user/${article.author.id}`}>
          <UserAvatar src={article.author.avatar} height="50" width="50" />
        </Link>
        <div>
          <Link
            to={`/user/${article.author.id}`}
            className="frontier-article-author-link"
          >
            <h4>{article.author.name}</h4>
          </Link>
          <p className="frontier-author-attribute-secondary-article-date">
            {article.createdAt}
          </p>
        </div>
      </div>
    </div>
  );
}

function TertiaryArticles({articles}) {
  return articles.map((article) => (
    <div key={article.id} className="frontier-tertiary-article">
      <div className="frontier-tertiary-article-header">
        <Link to={`/post/${article.id}`}>
          <h4 className="frontier-page-tertiary-article-title">
            {article.title}
          </h4>
        </Link>
      </div>
      <AuthorAttributes article={article} />
    </div>
  ));
}

function QuaternaryArticles({articles}) {
  return articles.map((article, i) => (
    <div
      className={
        i === 3
          ? 'frontier-page-last-quaternary-item'
          : 'frontier-page-quaternary-item'
      }
      key={article.id}
    >
      <div className="frontier-page-quaternary-item-text">
        <Link to={`/post/${article.id}`}>
          <h4>{article.title}</h4>
        </Link>
        <p>{article.content.text}</p>
      </div>
      <AuthorAttributes article={article} />
    </div>
  ));
}

function AuthorAttributes({article}) {
  return (
    <div className="frontier-tertiary-article-author-attributes">
      <Link to={`/user/${article.id}`} className="frontier-article-author-link">
        <h4>{article.author.name}</h4>
      </Link>
      <p className="frontier-author-attribute-tertiary-article-date">
        {article.createdAt}
      </p>
    </div>
  );
}
