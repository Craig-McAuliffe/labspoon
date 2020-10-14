import * as functions from 'firebase-functions';
import {admin, ResourceTypes} from './config';
import {firestore} from 'firebase-admin';
const spawn = require('child-process-promise').spawn;
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import {updateFilterCollection, Post} from './posts';

const db: firestore.Firestore = admin.firestore();

const storage = admin.storage();
export const generateAvatarThumbnailOnGroupCreate = functions.firestore
  .document(`groups/{groupID}`)
  .onCreate(async (change) => {
    console.log('avatar generation triggered');
    const groupID = change.id;
    const fullsizeAvatarPath = `groups/${groupID}/avatar_fullSize`;
    // download the fullsize image into memory
    const fileName = `${groupID}_avatarThumbnail`;
    const tmp = path.join(os.tmpdir(), fileName);
    const file = storage.bucket().file(fullsizeAvatarPath);
    await file.download({destination: tmp});
    const [metadata] = await file.getMetadata();
    console.log('image', fileName, 'downloaded locally to', tmp);
    // convert to thumbnail
    await spawn('convert', [tmp, '-thumbnail', '200x200>', tmp]);
    console.log('thumbnail created at', tmp);
    // upload thumbnail
    const thumbnailFileName = 'avatar';
    const thumbnailFilePath = path.join(
      path.dirname(fullsizeAvatarPath),
      thumbnailFileName
    );
    await storage.bucket().upload(tmp, {
      destination: thumbnailFilePath,
      metadata: {
        contentType: metadata.contentType,
      },
      predefinedAcl: 'publicRead',
    });
    // free up disk space
    fs.unlinkSync(tmp);
  });

export const createGroupDocuments = functions.firestore
  .document(`groups/{groupID}`)
  .onCreate(async (change, context) => {
    const groupID = context.params.groupID;
    db.collection(`groups/${groupID}/feeds`)
      .doc(`postsFeed`)
      .set({id: 'postsFeed'});
  });

export const addGroupMembersToPostFilter = functions.firestore
  .document(`groups/{groupID}/posts/{postID}`)
  .onCreate(async (change, context) => {
    const groupID = context.params.groupID;
    const post = change.data() as Post;
    const groupPostsFeedRef = db.doc(`groups/${groupID}/feeds/postsFeed`);
    updateFilterCollection(
      groupPostsFeedRef,
      {resourceName: 'Author', resourceType: ResourceTypes.USER},
      {
        name: post.author.name,
        resourceID: post.author.id,
        avatar: post.author.avatar,
      },
      false
    );
  });

export const removeGroupMembersFromPostFilter = functions.firestore
  .document(`groups/{groupID}/posts/{postID}`)
  .onDelete(async (change, context) => {
    const groupID = context.params.groupID;
    const post = change.data() as Post;
    const groupPostsFeedRef = db.doc(`groups/${groupID}/feeds/postsFeed`);
    updateFilterCollection(
      groupPostsFeedRef,
      {resourceName: 'Author', resourceType: ResourceTypes.USER},
      {
        name: post.author.name,
        resourceID: post.author.id,
        avatar: post.author.avatar,
      },
      true
    );
  });
