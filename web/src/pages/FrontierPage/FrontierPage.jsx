import React from 'react';
import {Link} from 'react-router-dom';
import HomePageTabs from '../../components/HomePageTabs';
import FilterableResults from '../../components/FilterableResults/FilterableResults';
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

  const getDefaultFilter = () => {
    return [];
  };
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
              <div className="frontier-page-headline-item-header">
                <div className="frontier-headline-article-author-container">
                  <Link
                    to={`/user/${topTenPosts[0].author.id}`}
                    className="frontier-article-author-link"
                  >
                    <div className="frontier-headline-article-avatar-container">
                      <UserAvatar
                        src={topTenPosts[0].author.avatar}
                        height="80"
                        width="80"
                      />
                    </div>
                    <h4 className="frontier-headline-article-author-name">
                      {topTenPosts[0].author.name}
                    </h4>
                  </Link>
                  <p className="frontier-headline-article-date">
                    {topTenPosts[0].createdAt}
                  </p>
                </div>
                <div>
                  <Link to={`/post/${topTenPosts[0].id}`}>
                    <h3>{topTenPosts[0].title}</h3>
                  </Link>
                  <p>{topTenPosts[0].content.text}</p>
                </div>
              </div>
            </div>
            <div className="frontier-page-secondary-items-container">
              <div className="frontier-page-secondary-article">
                <div className="frontier-page-secondary-article-text">
                  <Link to={`/post/${topTenPosts[1].id}`}>
                    <h4>{topTenPosts[1].title}</h4>
                  </Link>
                  <p>{topTenPosts[1].content.text}</p>
                </div>
                <div className="frontier-secondary-article-author-attributes">
                  <Link to={`/user/${topTenPosts[1].author.id}`}>
                    <UserAvatar
                      src={topTenPosts[1].author.avatar}
                      height="50"
                      width="50"
                    />
                  </Link>
                  <div>
                    <Link
                      to={`/user/${topTenPosts[1].author.id}`}
                      className="frontier-article-author-link"
                    >
                      <h4>{topTenPosts[1].author.name}</h4>
                    </Link>
                    <p className="frontier-author-attribute-secondary-article-date">
                      {topTenPosts[1].createdAt}
                    </p>
                  </div>
                </div>
              </div>
              <div className="frontier-page-tertiary-articles-container">
                <TertiaryArticles articles={topTenPosts.slice(2, 5)} />
              </div>
            </div>
            <div className="frontier-page-quaternary-items-container">
              <QuaternaryArticles articles={topTenPosts.slice(5, 11)} />
            </div>
          </div>
          <div className="frontier-page-feed">
            <FilterableResults
              fetchResults={fetchFeedData}
              getDefaultFilter={getDefaultFilter}
              limit={10}
              useTabs={false}
              useFilterSider={false}
            />
          </div>
        </div>
      </div>
    </>
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
