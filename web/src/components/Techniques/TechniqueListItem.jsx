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
  const title = technique.title;
  const body = technique.body;
  return (
    <ListItemContainer>
      <ArticleHeaderAndType
        title={title}
        resourceType={TECHNIQUE}
        icon={<TechniqueIcon />}
        resourceID={technique.id}
        authorID={technique.author.id}
      />
      <ImagesSection
        images={formatTaggedImages(technique.photoURLs)}
        customMargin="20px"
      />
      <ExpandableText resourceID={technique.id}>
        <RichTextBody body={body} />
      </ExpandableText>
      <ListItemTopics
        dbTopics={technique.topics}
        customTopics={technique.customTopics}
      />
      <GroupSignature group={technique.group} />
    </ListItemContainer>
  );
}
