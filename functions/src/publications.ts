import * as functions from 'firebase-functions';
// @ts-ignore
import CrossRef from 'crossref';

export const searchPublications = functions.https.onCall(async (data, context) => {
    console.log(data);
    let resp;
    const options = {
        mailto: 'patrick@labspoon.com',
        ...data,
    }; 
    const crossRefResp = new Promise((resolve, reject) => {
        CrossRef.works(options, (err: Error, objects: Array<Object>, nextOptions: Object, isDone: Boolean, message: Array<Object>) => {
            if (err) reject(err);
            resp = {err, objects, nextOptions, isDone, message};
            resolve(data);
        })
    });
    await crossRefResp.catch((err) => console.log(err));
    return resp;
});