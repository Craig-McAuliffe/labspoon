export function dbPublicationToJSPublication(dbPublication) {
  const JSPublication = dbPublication;
  JSPublication.resourceType = 'publication';
  JSPublication.content = {};
  JSPublication.content.authors = dbPublication.authors;
  JSPublication.content.abstract = dbPublication.abstract;
  return JSPublication;
}
