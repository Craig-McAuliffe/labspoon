import * as functions from 'firebase-functions';
import * as adminNS from 'firebase-admin';

export const config = functions.config();
export const admin = adminNS.initializeApp({
  storageBucket: config.env.storagebucket,
});

export const environment = config.env.name;
export const url = config.env.url;

export enum ResourceTypes {
  USER = 'user',
  GROUP = 'group',
  POST = 'post',
  PUBLICATION = 'publication',
  TOPIC = 'topic',
  // meta type for all types of post
  POST_TYPE = 'postType',
}
