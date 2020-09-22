import * as functions from 'firebase-functions';

export const admin = require('firebase-admin');
admin.initializeApp();

export const config = functions.config();
export const environment = config.env.name;

export enum ResourceTypes {
    USER = 'user',
    GROUP = 'group',
    POST = 'post',
    PUBLICATION = 'publication',
    TOPIC = 'topic',
    // meta type for all types of post
    POST_TYPE = 'postType',
}