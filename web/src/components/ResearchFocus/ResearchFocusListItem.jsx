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
    <ListItemContainer backgroundShade={researchFocus.backgroundShade}>
      <ArticleHeaderAndType
        title={researchFocus.title}
        resourceType={RESEARCHFOCUS}
        icon={<ResearchFocusIcon />}
        resourceID={researchFocus.id}
        authorID={researchFocus.author.id}
        article={researchFocus}
        backgroundShade={researchFocus.backgroundShade}
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
          backgroundShade={researchFocus.backgroundShade}
        />
      </ExpandableText>
      <ListItemTopics
        backgroundShade={researchFocus.backgroundShade}
        dbTopics={researchFocus.topics}
        customTopics={researchFocus.customTopics}
      />
      <GroupSignature
        backgroundShade={researchFocus.backgroundShade}
        group={researchFocus.group}
      />
    </ListItemContainer>
  );
}
