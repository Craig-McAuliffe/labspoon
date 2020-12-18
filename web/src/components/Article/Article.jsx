import React from 'react';
import {Link} from 'react-router-dom';

import './Article.css';

export function Title({children}) {
  return <h2>{children}</h2>;
}

export function Paragraph({children}) {
  return <p>{children}</p>;
}

export function Author({authorID, name}) {
  return (
    <div className="author-container">
      <p className="field-label">Created By</p>
      <Link to={`/user/${authorID}`}>{name}</Link>
    </div>
  );
}
