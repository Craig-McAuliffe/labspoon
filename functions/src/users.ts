import * as functions from 'firebase-functions';
import {admin} from './config';
import {
  interpretQuery,
  executeExpression,
  MAKPublication,
  Publication,
  makPublicationToPublication,
} from './microsoft';

const db = admin.firestore();

export const instantiateFollowingFeedForNewUser = functions.firestore
  .document('users/{userID}')
  .onCreate(async (change, context) => {
    const userID = change.id;
    await db.doc(`users/${userID}/feeds/followingFeed`).set({
      id: 'followingFeed',
    });
  });

export const setUserIsFollowedBySelfOnCreation = functions.firestore
  .document('users/{userID}')
  .onCreate(async (change, context) => {
    const userID = change.id;
    const user = change.data();
    const userRef: UserRef = {
      id: change.id,
      name: user.name,
    };
    if (user.avatar) userRef.avatar = user.avatar;
    await db.doc(`users/${userID}/followedByUsers/${userID}`).set(userRef);
  });

// for a set of selected publications, set the user's microsoft academic ID
export const setMicrosoftAcademicIDByPublicationMatches = functions.https.onCall(
  async (data, context) => {
    if (context.auth === undefined) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Must be authenticated to create a post'
      );
    }
    const userID = context.auth.uid;

    const selectedPublicationSuggestions: PublicationSuggestion[] =
      data.publicationSuggestions;
    if (
      !selectedPublicationSuggestions ||
      selectedPublicationSuggestions.length === 0
    )
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Must provide selected publication suggestions'
      );
    const seenIDs: Set<string> = new Set();
    selectedPublicationSuggestions.forEach(
      (publicationSuggestion: PublicationSuggestion) =>
        seenIDs.add(publicationSuggestion.microsoftAcademicIDMatch)
    );
    if (seenIDs.size !== 1)
      throw new functions.https.HttpsError(
        'invalid-argument',
        'All selected publications must be from same user'
      );
    const microsoftAcademicAuthorID =
      selectedPublicationSuggestions[0].microsoftAcademicIDMatch;

    await db.doc(`users/${userID}`).update({
      microsoftAcademicAuthorID: microsoftAcademicAuthorID,
    });
  }
);

// for a given name, return potential matching publications so the user can select theirs
export const getSuggestedPublicationsForAuthorName = functions.https.onCall(
  async (data, context) => {
    const name = data.name;
    if (name === undefined)
      throw new functions.https.HttpsError(
        'invalid-argument',
        'A name must be provided'
      );
    // retrieve expressions for retrieving results related to the search query
    const expressions: Array<string> = await interpretQuery({
      query: name as string,
      complete: 1,
      count: 10,
    })
      .then((resp) =>
        resp.data.interpretations.map(
          // TODO: filter out non-author rules
          (result: interpretationResult) => result.rules[0].output.value
        )
      )
      .catch((err) => {
        throw new functions.https.HttpsError('internal', 'An error occurred.');
      });
    const executePromises = expressions.map((expression) => {
      return executeExpression({
        expr: expression,
        count: 100,
        attributes: 'AA.AuId,AA.AuN,AA.DAuN,D,DN',
      })
        .then((resp) => {
          const evaluateExpression = resp.data.expr;
          const normalisedAuthorNameRegex = /AA\.AuN=='(?<name>[a-z ]*)'/;
          const authorMatches = normalisedAuthorNameRegex.exec(
            evaluateExpression
          );
          if (!authorMatches) {
            console.warn(
              'Could not extract a normalised author name from the evaluate expression:',
              evaluateExpression
            );
            return undefined;
          }
          const normalisedAuthorName = authorMatches[1];
          const publications: PublicationSuggestion[] = resp.data.entities.map(
            (entity: MAKPublication) => {
              const publication = makPublicationToPublication(entity);
              const authors = publication.authors!;
              const matchingAuthor = authors.find(
                (author) => author.normalisedName === normalisedAuthorName
              )!;
              const publicationSuggestion: PublicationSuggestion = {
                microsoftAcademicIDMatch: matchingAuthor.ID,
                publicationInfo: publication,
              };
              return publicationSuggestion;
            }
          );
          // want to return a maximum of two papers per author
          const seenAuthorIDs = new Map();
          return publications.filter((publicationSuggestion) => {
            const matchingAuthorID =
              publicationSuggestion.microsoftAcademicIDMatch;
            if (seenAuthorIDs.get(matchingAuthorID) === 2) return false;
            if (seenAuthorIDs.get(matchingAuthorID) === 1)
              seenAuthorIDs.set(matchingAuthorID, 2);
            if (!seenAuthorIDs.has(matchingAuthorID))
              seenAuthorIDs.set(matchingAuthorID, 1);
            return true;
          });
        })
        .catch((err) => {
          console.error(err);
          throw new functions.https.HttpsError(
            'internal',
            'An error occurred.'
          );
        });
    });
    const publicationsByInterpretation = await Promise.all(executePromises);
    const suggestedPublications = flatten(publicationsByInterpretation);
    return suggestedPublications;
  }
);

const flatten = function (arr: Array<any>, result: Array<any> = []) {
  for (let i = 0, length = arr.length; i < length; i++) {
    const value = arr[i];
    if (Array.isArray(value)) {
      flatten(value, result);
    } else {
      result.push(value);
    }
  }
  return result;
};

interface interpretationResult {
  logprob: number;
  parse: string;
  rules: Array<interpretationRules>;
}

interface interpretationRules {
  name: string;
  output: interpretationRuleOutput;
}

interface interpretationRuleOutput {
  type: string;
  value: string;
}

interface PublicationSuggestion {
  microsoftAcademicIDMatch: string;
  publicationInfo: Publication;
}

export interface UserRef {
  id: string;
  name: string;
  avatar?: string;
}