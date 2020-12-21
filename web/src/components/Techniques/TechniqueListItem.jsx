import React from 'react';
import {formatTaggedImages, ImagesSection} from '../Media/ImageListItem';
import {TechniqueIcon} from '../../assets/ResourceTypeIcons';
import {ListItemContainer} from '../ListItem/ListItemCommonComponents';
import {RichTextBody, ArticleHeaderAndType} from '../Article/Article';
import ListItemTopics from '../ListItem/ListItemTopics';
import GroupSignature from '../Group/GroupSignature';

export default function TechniqueListItem({technique}) {
  const title = technique.title;
  const body = technique.body;
  return (
    <ListItemContainer>
      <ArticleHeaderAndType
        title={title}
        resourceType={technique.resourceType}
        icon={<TechniqueIcon />}
        resourceID={technique.id}
      />
      <ImagesSection images={formatTaggedImages(technique.photoURLs)} />
      <RichTextBody body={body} />
      <ListItemTopics
        dbTopics={technique.topics}
        customTopics={technique.customTopics}
      />
      <GroupSignature group={technique.group} />
    </ListItemContainer>
  );
}
