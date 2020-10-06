import * as functions from 'firebase-functions';
import {config} from './config';
// @ts-ignore
import CrossRef from 'crossref';
import axios from 'axios';

export const microsoftAcademicKnowledgePublicationSearch = functions.https.onCall(
    async (data, context) => {
        if (!config.microsoftAcademicKnowledgeAPI || !config.microsoftAcademicKnowledgeAPI.subscriptionKey) {
            throw new functions.https.HttpsError('unavailable', 'Microsoft Academic Knowledge API is not configured in this environment');
        }
        const subscriptionKey = config.microsoftAcademicKnowledgeAPI.subscriptionKey;
        
        const baseURL = 'https://api.labs.cognitive.microsoft.com/academic/v1.0';
        const headers = {
            'Ocp-Apim-Subscription-Key': subscriptionKey,
        };
        let results;
        await axios({
            method: 'get',
            url: '/interpret',
            baseURL: baseURL,
            headers: headers,
            params: {
                query: data.query,
                complete: 1,
                count: 1,
            },
        })
            .then((resp) => {
                return axios({
                    method: 'get',
                    url: '/evaluate',
                    baseURL: baseURL,
                    headers: headers,
                    params: {
                        // `Ty='0'` retrieves only publication type results 
                        // https://docs.microsoft.com/en-us/academic-services/project-academic-knowledge/reference-entity-attributes 
                        expr: `And(${resp.data.interpretations[0].rules[0].output.value}, Ty='0')`,
                        count: 10,
                        attributes: 'AA.AuN,DN'
                    }
                })
            })
            .then((resp) => {
                results = resp.data.entities.map(makPublicationToPublication);
            })
            .catch((err) => {
                console.error(err);
                throw new functions.https.HttpsError('internal', 'An error occured.')
            });
        return results;
    }
);

function makPublicationToPublication(makPublication: MAKPublication): Publication {
    return {
        title: makPublication.DN,
        authors: makPublication.AA.map(makAuthorToAuthor),
    }
}

interface MAKPublication  {
    logprob: number,
    prob: string,
    DN: string,
    AA: Array<MAKAuthor>,
}

interface Publication {
    title: string,
    authors: Array<Author>,
}

function makAuthorToAuthor(makAuthor: MAKAuthor): Author {
    return {
        name: makAuthor.AuN,
    };
} 

interface MAKAuthor {
    AuN: string,
}

interface Author {
    name: string,
}