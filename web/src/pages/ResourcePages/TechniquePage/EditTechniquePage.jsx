import React from 'react';
import {useParams} from 'react-router-dom';
import {TECHNIQUE, TECHNIQUES} from '../../../helpers/resourceTypeDefinitions';
import EditArticle from '../../../components/Article/EditArticle';

export default function EditResearchFocusPage({}) {
  const {techniqueID} = useParams();
  return (
    <EditArticle
      articleCollectionName={TECHNIQUES}
      articleID={techniqueID}
      articleType={TECHNIQUE}
    />
  );
}
