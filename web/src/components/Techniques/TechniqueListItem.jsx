import React from 'react';
import {formatTaggedImages, ImagesSection} from '../Images/ImageListItem';
import {TechniqueIcon} from '../../assets/ResourceTypeIcons';
import {
  ExpandableText,
  ListItemContainer,
} from '../ListItem/ListItemCommonComponents';
import {RichTextBody, ArticleHeaderAndType} from '../Article/Article';
import ListItemTopics from '../ListItem/ListItemTopics';
import GroupSignature from '../Group/GroupSignature';
import {TECHNIQUE} from '../../helpers/resourceTypeDefinitions';

export default function TechniqueListItem({technique}) {
  return (
    <ListItemContainer backgroundShade={technique.backgroundShade}>
      <ArticleHeaderAndType
        title={technique.title}
        resourceType={TECHNIQUE}
        icon={<TechniqueIcon />}
        resourceID={technique.id}
        authorID={technique.author.id}
        article={technique}
        backgroundShade={technique.backgroundShade}
      />
      <ImagesSection
        images={formatTaggedImages(technique.photoURLs)}
        customMargin="20px"
      />
      <ExpandableText resourceID={technique.id}>
        <RichTextBody
          backgroundShade={technique.backgroundShade}
          body={technique.body}
        />
      </ExpandableText>
      <ListItemTopics
        backgroundShade={technique.backgroundShade}
        dbTopics={technique.topics}
        customTopics={technique.customTopics}
      />
      <GroupSignature
        group={technique.group}
        backgroundShade={technique.backgroundShade}
      />
    </ListItemContainer>
  );
}
