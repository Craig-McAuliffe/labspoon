import * as functions from 'firebase-functions';
import * as adminNS from 'firebase-admin';

export const config = functions.config();
export const admin = adminNS.initializeApp();

export const environment = config.env.name;
export const url = config.env.url;
export const domain = config.domain.url;
export enum ResourceTypes {
  USER = 'user',
  GROUP = 'group',
  POST = 'post',
  PUBLICATION = 'publication',
  TOPIC = 'topic',
  OPEN_POSITION = 'openPosition',
  // meta type for all types of post
  POST_TYPE = 'postType',
  RESEARCH_FOCUS = 'researchFocus',
  TECHNIQUE = 'technique',
}

export enum ResourceTypesCollections {
  USERS = 'users',
  GROUPS = 'groups',
  POSTS = 'posts',
  PUBLICATIONS = 'publications',
  TOPICS = 'topics',
  OPEN_POSITIONS = 'openPositions',
  RESEARCH_FOCUSES = 'researchFocuses',
  TECHNIQUES = 'techniques',
}

export enum PostTypesIDs {
  DEFAULT_POST = 'defaultPost',
  PUBLICATION_POST = 'publicationPost',
  OPEN_POSITION_POST = 'openPositionPost',
  EVENT_POST = 'eventPost',
  PROJECT_GRANT_POST = 'projectGrantPost',
  QUESTION_POST = 'questionPost',
  IDEA_POST = 'ideaPost',
  SUB_TOPIC_POST = 'subTopicPost',
}
