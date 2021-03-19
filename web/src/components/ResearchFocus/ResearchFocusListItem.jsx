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
import {RESEARCHFOCUS} from '../../helpers/resourceTypeDefinitions';

import './ResearchFocusListItem.css';

export default function ResearchFocusListItem({researchFocus}) {
  return (
    <ListItemContainer>
      <ArticleHeaderAndType
        title={researchFocus.title}
        resourceType={RESEARCHFOCUS}
        icon={<ResearchFocusIcon />}
        resourceID={researchFocus.id}
        authorID={researchFocus.author.id}
      />
      <ImagesSection
        images={formatTaggedImages(researchFocus.photoURLs)}
        customMargin="20px"
      />
      <ExpandableText resourceID={researchFocus.id}>
        <RichTextBody
          body={researchFocus.body}
          expandable={true}
          id={researchFocus.id}
        />
      </ExpandableText>
      <ListItemTopics
        dbTopics={researchFocus.topics}
        customTopics={researchFocus.customTopics}
      />
      <GroupSignature group={researchFocus.group} />
    </ListItemContainer>
  );
}
