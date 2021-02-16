import * as functions from 'firebase-functions';
import * as adminNS from 'firebase-admin';

export const config = functions.config();
export const admin = adminNS.initializeApp();

export const environment = config.env.name;
export const url = config.env.url;

export enum ResourceTypes {
  USER = 'user',
  GROUP = 'group',
  POST = 'post',
  PUBLICATION = 'publication',
  TOPIC = 'topic',
  OPEN_POSITION = 'openPosition',
  // meta type for all types of post
  POST_TYPE = 'postType',
}
