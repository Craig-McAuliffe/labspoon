import React from 'react';
import {formatTaggedImages, ImagesSection} from '../Media/ImageListItem';
import {ResearchFocusIcon} from '../../assets/ResourceTypeIcons';
import {ListItemContainer} from '../ListItem/ListItemCommonComponents';
import {RichTextBody, ArticleHeaderAndType} from '../Article/Article';
import ListItemTopics from '../ListItem/ListItemTopics';
import GroupSignature from '../Group/GroupSignature';

import './ResearchFocusListItem.css';

export default function ResearchFocusListItem({researchFocus}) {
  const title = researchFocus.title;
  const body = researchFocus.body;
  return (
    <ListItemContainer>
      <ArticleHeaderAndType
        title={title}
        resourceType={researchFocus.resourceType}
        icon={<ResearchFocusIcon />}
        resourceID={researchFocus.id}
      />
      <ImagesSection images={formatTaggedImages(researchFocus.photoURLs)} />
      <RichTextBody body={body} />
      <ListItemTopics
        dbTopics={researchFocus.topics}
        customTopics={researchFocus.customTopics}
      />
      <GroupSignature group={researchFocus.group} />
    </ListItemContainer>
  );
}
