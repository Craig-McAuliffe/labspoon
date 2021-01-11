import React from 'react';
import {formatTaggedImages, ImagesSection} from '../Images/ImageListItem';
import {ResearchFocusIcon} from '../../assets/ResourceTypeIcons';
import {
  ExpandableText,
  ListItemContainer,
} from '../ListItem/ListItemCommonComponents';
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
      <ImagesSection
        images={formatTaggedImages(researchFocus.photoURLs)}
        customMargin="20px"
      />
      <ExpandableText resourceID={researchFocus.id}>
        <RichTextBody body={body} expandable={true} id={researchFocus.id} />
      </ExpandableText>
      <ListItemTopics
        dbTopics={researchFocus.topics}
        customTopics={researchFocus.customTopics}
      />
      <GroupSignature group={researchFocus.group} />
    </ListItemContainer>
  );
}
