import React from 'react';
import {useParams} from 'react-router-dom';
import {
  RESEARCHFOCUS,
  RESEARCHFOCUSES,
} from '../../../helpers/resourceTypeDefinitions';
import EditArticle from '../../../components/Article/EditArticle';

import './EditResearchFocusPage.css';

export default function EditResearchFocusPage({}) {
  const {researchFocusID} = useParams();
  return (
    <EditArticle
      articleCollectionName={RESEARCHFOCUSES}
      articleID={researchFocusID}
      articleType={RESEARCHFOCUS}
    />
  );
}
