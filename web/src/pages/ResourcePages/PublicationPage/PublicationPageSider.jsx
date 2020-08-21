import React from 'react';
import {Link} from 'react-router-dom';
import {findSimilarPublications} from '../../../mockdata/publications';

export default function PublicationSider({currentPublication}) {
  const search = false;

  const topicIDs = currentPublication.topics
    .map((topic) => topic.id)
    .slice(0, 2);

  const similarPublications = () =>
    findSimilarPublications(topicIDs, currentPublication.id).map(
      (publication) => (
        <div className="suggested-publication" key={publication.id}>
          <Link to={`/publication/${publication.id}`}>{publication.title}</Link>
        </div>
      )
    );
  const fromContextPublications = () => <p>Other publications from search</p>;

  return search ? fromContextPublications() : similarPublications();
}
