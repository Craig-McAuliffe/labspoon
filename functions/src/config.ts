import * as functions from 'firebase-functions';
import * as adminNS from 'firebase-admin';

export const admin = adminNS.initializeApp();

export const config = functions.config();
export const environment = config.env.name;
export const projectURL = 'labspoon-dev-266bc.appspot.com';

export enum ResourceTypes {
    USER = 'user',
    GROUP = 'group',
    POST = 'post',
    PUBLICATION = 'publication',
    TOPIC = 'topic',
    // meta type for all types of post
    POST_TYPE = 'postType',
}