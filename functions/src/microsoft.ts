import * as functions from 'firebase-functions';
import {config} from './config';
import axios, {AxiosPromise} from 'axios';
import {Topic} from './topics';

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
  });
}

interface executeParams {
  expr: string;
  count: number;
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
): Publication {
  const publication = {} as Publication;
  if (makPublication.D) publication.date = makPublication.D;
  if (makPublication.DN) publication.title = makPublication.DN;
  if (makPublication.AA) publication.authors = makPublication.AA.map(makAuthorToAuthor);
  if (makPublication.Id) publication.microsoftID = makPublication.Id.toString();
  if (makPublication.F) publication.topics = makPublication.F.map(makFieldToTopic);
  return publication;
}

export interface MAKPublication {
  logprob: number;
  prob: string;
  D?: string,
  DN?: string;
  AA?: Array<MAKAuthor>;
  Id?: number;
  F?: MAKField[];
  // Tracks whether the publication has been added to the Labspoon publications. Defaults to false.
  processed?: boolean,
}

export interface Publication {
  date?: string;
  title?: string;
  authors?: Array<Author>;
  microsoftID?: string;
  topics?: Topic[];
}

function makAuthorToAuthor(makAuthor: MAKAuthor): Author {
  const author: Author = {
    ID: makAuthor.AuId,
    name: makAuthor.DAuN,
  };
  if (makAuthor.DAuN) author.normalisedName = makAuthor.AuN;
  return author;
}

interface MAKAuthor {
  AuId: string;
  AuN?: string;
  DAuN: string;
}

export interface Author {
  ID: string;
  name: string;
  normalisedName?: string;
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
}

export function makFieldToTopic(field: MAKField): Topic {
  return {
    microsoftID: field.FId.toString(),
    name: field.DFN,
    normalisedName: field.FN,
  };
}
