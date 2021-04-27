import * as functions from 'firebase-functions';
import {config, environment} from './config';
import axios, {AxiosPromise} from 'axios';
import {Topic} from './topics';
import {
  allPublicationFields,
  publishAddPublicationRequests,
  PublicationNoTopicIDs,
} from './publications';
import {UserPublicationRef, ExpressionAndName} from './users';
import {flatten} from './helpers';

const baseURL = 'https://api.labs.cognitive.microsoft.com/academic/v1.0';

function getSubscriptionKey() {
  if (
    !config.microsoftacademicknowledgeapi ||
    !config.microsoftacademicknowledgeapi.subscriptionkey
  ) {
    throw new functions.https.HttpsError(
      'unavailable',
      'Microsoft Academic Knowledge API is not configured in this environment'
    );
  }
  return config.microsoftacademicknowledgeapi.subscriptionkey;
}

interface interpretParams {
  query: string;
  complete: 0 | 1;
  count: number;
}

export function interpretQuery(params: interpretParams): AxiosPromise {
  return axios({
    method: 'get',
    url: '/interpret',
    baseURL: baseURL,
    headers: {
      'Ocp-Apim-Subscription-Key': getSubscriptionKey(),
    },
    params,
  }).then((resp) => {
    if (resp.data.timed_out)
      throw new functions.https.HttpsError(
        'deadline-exceeded',
        'Query timed out'
      );
    if (resp.data.interpretations.length === 0) return new Promise(() => null);
    return resp;
  });
}

// If we are running the functions locally, we don't want to brick the
// emulators with too many add publication requests, so we use a smaller number
// of interpretations and smaller page size for each of those interpretations.
const SUGGESTED_PUBLICATIONS_INTERPRETATIONS_COUNT =
  environment === 'local' ? 1 : 4;
const SUGGESTED_PUBLICATIONS_EXECUTION_PAGE_SIZE =
  environment === 'local' ? 4 : 8;
const FRONT_END_SCROLL_LIMIT = 12;
export const interpretAuthorPubSearch = functions.https.onCall(async (data) => {
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
    count: SUGGESTED_PUBLICATIONS_INTERPRETATIONS_COUNT,
  })
    .then((resp) =>
      resp.data.interpretations.map(
        // TODO: filter out non-author rules
        (result: interpretationResult) => result.rules[0].output.value
      )
    )
    .catch((err) => {
      console.error(err);
      throw new functions.https.HttpsError('internal', 'An error occurred.');
    });
  const authorExpressionsAndNames: Array<ExpressionAndName> = [];
  expressions.forEach((expression) => {
    const evaluateExpression = expression;
    const normalisedAuthorNameRegex = /AA\.AuN=='(?<name>[a-z ]*)'/;
    const authorMatches = normalisedAuthorNameRegex.exec(evaluateExpression);
    if (!authorMatches) {
      console.warn(
        'No normalised author name within evaluate expression ',
        evaluateExpression
      );
      return;
    }
    // get the first capturing group in the regex match
    const normalisedAuthorName = authorMatches[1];
    authorExpressionsAndNames.push({
      expression: expression,
      name: normalisedAuthorName,
    });
    return;
  });
  return authorExpressionsAndNames;
});

// for a given name, return potential matching publications so the user can select theirs
export const getSuggestedPublicationsForAuthorName = functions.https.onCall(
  async (data) => {
    let offset: number = data.offset ? data.offset : 0;
    const expressionsAndNames: Array<ExpressionAndName> =
      data.expressionsAndNames;
    if (!expressionsAndNames || expressionsAndNames.length === 0)
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Expressions and names are required'
      );
    const publicationsByInterpretation = await Promise.all(
      msExecuteAuthorExpressions(offset, expressionsAndNames)
    );
    const suggestedPublications = flatten(publicationsByInterpretation);
    // filter out null values
    const filteredNullResults = suggestedPublications.filter(Boolean);
    const filteredDuplicateResults: Array<PublicationSuggestion> = [];
    const filterDuplicateSuggestedPublications = (
      newSuggestedPublication: PublicationSuggestion
    ) =>
      filteredDuplicateResults.some(
        (filteredSuggestion) =>
          filteredSuggestion.publicationInfo.microsoftID ===
          newSuggestedPublication.publicationInfo.microsoftID
      );
    filteredNullResults.forEach((suggestedPublication) => {
      if (filterDuplicateSuggestedPublications(suggestedPublication)) return;
      return filteredDuplicateResults.push(suggestedPublication);
    });
    if (filteredDuplicateResults.length < FRONT_END_SCROLL_LIMIT) {
      offset = offset + SUGGESTED_PUBLICATIONS_EXECUTION_PAGE_SIZE;
      const morePublicationsByInterpretation = await Promise.all(
        msExecuteAuthorExpressions(offset, expressionsAndNames)
      );
      const moreSuggestedPublications = flatten(
        morePublicationsByInterpretation
      );
      const moreNullFilteredSuggestedPublications = moreSuggestedPublications.filter(
        Boolean
      );
      moreNullFilteredSuggestedPublications.forEach(
        (newPublicationSuggestion) => {
          if (filterDuplicateSuggestedPublications(newPublicationSuggestion))
            return;
          filteredDuplicateResults.push(newPublicationSuggestion);
        }
      );
    }
    offset = offset + SUGGESTED_PUBLICATIONS_EXECUTION_PAGE_SIZE;
    return {
      publications: filteredDuplicateResults,
      offset: offset,
    };
  }
);

export const msExecuteAuthorExpressions = (
  offset: number,
  expressionsAndNames: Array<ExpressionAndName>
) =>
  expressionsAndNames.map(async (expressionAndName) => {
    const expression = expressionAndName.expression;
    const normalisedAuthorName = expressionAndName.name;
    if (!expression || !normalisedAuthorName)
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Expressions and names are required'
      );
    return executeExpression({
      expr: expression,
      count: SUGGESTED_PUBLICATIONS_EXECUTION_PAGE_SIZE,
      attributes: allPublicationFields,
      offset: offset,
    })
      .then(async (resp) => {
        const makPublications: MAKPublication[] = resp.data.entities;
        await publishAddPublicationRequests(makPublications);
        const publicationsWithAuthor: PublicationSuggestion[] = [];
        makPublications.forEach((entity: MAKPublication) => {
          const publication = makPublicationToPublication(entity);
          const authors = publication.authors!;
          const matchingAuthor = authors.find(
            (author) => author.normalisedName === normalisedAuthorName
          )!;
          if (!matchingAuthor || !matchingAuthor.microsoftID) return;
          const publicationSuggestion: PublicationSuggestion = {
            microsoftAcademicAuthorID: matchingAuthor.microsoftID,
            publicationInfo: publication,
          };
          publicationsWithAuthor.push(publicationSuggestion);
        });
        // want to return a maximum of two papers per author

        const seenAuthorIDs = new Map();
        return publicationsWithAuthor.filter((publicationSuggestion) => {
          const matchingAuthorID =
            publicationSuggestion.microsoftAcademicAuthorID;
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
        throw new functions.https.HttpsError('internal', 'An error occurred.');
      });
  });

export const getPublicationsByAuthorIDExpression = functions.https.onCall(
  async (data) => {
    const expression: string = data.expression;
    const count: number = data.count;
    const offset: number = data.offset;
    if (!expression || !count)
      throw new functions.https.HttpsError(
        'invalid-argument',
        'An expression and count are required in the request'
      );
    return fetchAndHandlePublicationsForAuthor(expression, count, offset);
  }
);

export async function fetchAndHandlePublicationsForAuthor(
  expression: string,
  count: number,
  offset: number
) {
  const fetchedPubs = await executeExpression({
    expr: expression,
    count: count,
    attributes: allPublicationFields,
    offset: offset,
  })
    .then(async (resp) => {
      const makPublications: MAKPublication[] = resp.data.entities;
      await publishAddPublicationRequests(makPublications);
      return makPublications;
    })
    .catch((err) => {
      console.error(`unable to execute expression ${expression} ${err}`);
      throw new functions.https.HttpsError(
        'internal',
        'Microsoft evaluate failed for given expression'
      );
    });
  return fetchedPubs.map((makPub) => makPublicationToPublication(makPub));
}

interface executeParams {
  expr: string;
  count: number;
  offset?: number;
  attributes: string;
}

export function executeExpression(params: executeParams): AxiosPromise {
  return axios({
    method: 'get',
    url: '/evaluate',
    baseURL: baseURL,
    headers: {
      'Ocp-Apim-Subscription-Key': getSubscriptionKey(),
    },
    params: params,
  });
}

export function makPublicationToPublication(
  makPublication: MAKPublication
): PublicationNoTopicIDs {
  const publication = {} as PublicationNoTopicIDs;
  if (makPublication.D) publication.date = makPublication.D;
  if (makPublication.DN) publication.title = makPublication.DN;
  if (makPublication.AA)
    publication.authors = makPublication.AA.map(makAuthorToAuthor);
  if (makPublication.Id) publication.microsoftID = makPublication.Id.toString();
  if (makPublication.F)
    publication.topics = makPublication.F.map(makFieldToTopic);
  if (makPublication.S)
    publication.sources = makPublication.S.map(makSourceToSource);
  if (makPublication.RId)
    publication.referencedPublicationMicrosoftIDs = makPublication.RId.map(
      (strid) => strid.toString()
    );
  return publication;
}

export interface MAKPublication {
  logprob: number;
  prob: string;
  D?: string;
  DN?: string;
  AA?: Array<MAKAuthor>;
  Id?: number;
  F?: MAKField[];
  S?: MAKSource[];
  RId?: string[];
  // Tracks corresponding Labspoon publication.
  processed?: string;
}

export function makSourceToSource(makSource: MAKSource) {
  let sourceType;
  switch (makSource.Ty) {
    case 0:
      sourceType = SourceType.HTML;
      break;
    case 1:
      sourceType = SourceType.TEXT;
      break;
    case 2:
      sourceType = SourceType.PDF;
      break;
    case 3:
      sourceType = SourceType.DOC;
      break;
    case 4:
      sourceType = SourceType.PPT;
      break;
    case 5:
      sourceType = SourceType.XLS;
      break;
    case 6:
      sourceType = SourceType.PS;
      break;
    default:
      sourceType = SourceType.HTML;
  }
  return {
    type: sourceType,
    url: makSource.U,
  };
}

interface MAKSource {
  Ty: number;
  U: string;
}

enum SourceType {
  HTML = 'html',
  TEXT = 'text',
  PDF = 'pdf',
  DOC = 'doc',
  PPT = 'ppt',
  XLS = 'xls',
  PS = 'ps',
}

export interface Source {
  type: SourceType;
  url: string;
}

export function makAuthorToAuthor(makAuthor: MAKAuthor): UserPublicationRef {
  const author: UserPublicationRef = {
    microsoftID: makAuthor.AuId.toString(),
    name: makAuthor.DAuN,
  };
  if (makAuthor.DAuN) author.normalisedName = makAuthor.AuN;
  return author;
}

export interface MAKAuthor {
  AuId: string;
  AuN?: string;
  DAuN: string;
  processed?: string;
}

export interface User {
  id?: string;
  name: string;
  normalisedName?: string;
  microsoftID?: string;
  avatar?: string;
}

export interface interpretationResult {
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

export interface MAKField {
  DFN: string;
  FId: number;
  FN: string;
  processed: string;
}

export interface MAKPublicationInDB {
  D?: string;
  DN?: string;
  AA?: Array<MAKAuthor>;
  Id?: number;
  F?: MAKField[];
  S?: MAKSource[];
  RId?: string[];
  // Tracks whether the publication has been added to the Labspoon publications. Defaults to false.
  processed?: string;
}

export function makFieldToTopic(field: MAKField): Topic {
  return {
    microsoftID: field.FId.toString(),
    name: field.DFN,
    normalisedName: field.FN,
  };
}

export function TopicToMAKField(
  topic: Topic,
  labspoonTopicID: string
): MAKField {
  return {
    FId: Number(topic.microsoftID),
    DFN: topic.name,
    FN: topic.normalisedName,
    processed: labspoonTopicID,
  };
}

interface PublicationSuggestion {
  microsoftAcademicAuthorID: string;
  publicationInfo: PublicationNoTopicIDs;
}
