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
  }).then((resp) => {
    if (resp.data.timed_out) throw new functions.https.HttpsError('deadline-exceeded', 'Query timed out');
    if (resp.data.interpretations.length === 0) return new Promise(() => null);
    return resp;
  });
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
): Publication {
  const publication = {} as Publication;
  if (makPublication.D) publication.date = makPublication.D;
  if (makPublication.DN) publication.title = makPublication.DN;
  if (makPublication.AA)
    publication.authors = makPublication.AA.map(makAuthorToAuthor);
  if (makPublication.Id) publication.microsoftID = makPublication.Id.toString();
  if (makPublication.F)
    publication.topics = makPublication.F.map(makFieldToTopic);
  if (makPublication.S) publication.sources = makPublication.S.map(makSourceToSource);
  if (makPublication.RId) publication.referencedPublicationMicrosoftIDs = makPublication.RId.map((strid) => strid.toString());
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

export interface Publication {
  date?: string;
  title?: string;
  authors?: User[];
  microsoftID?: string;
  topics?: Topic[];
  sources: Source[],
  referencedPublicationMicrosoftIDs: string[];
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
  Ty: number,
  U: string,
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
  type: SourceType,
  url: string,
}

export function makAuthorToAuthor(makAuthor: MAKAuthor): User {
  const author: User = {
    microsoftID: makAuthor.AuId,
    name: makAuthor.DAuN,
  };
  if (makAuthor.DAuN) author.normalisedName = makAuthor.AuN;
  return author;
}

export interface MAKAuthor {
  AuId: string;
  AuN?: string;
  DAuN: string;
}

export interface User {
  id?: string;
  name: string;
  normalisedName?: string;
  microsoftID?: string;
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

export interface MAKFieldUnProcessed {
  DFN: string;
  FId: number;
  FN: string;
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

export function TopicToMAKField(topic: Topic): MAKFieldUnProcessed {
  return {
    FId: Number(topic.microsoftID),
    DFN: topic.name,
    FN: topic.normalisedName,
  };
}
