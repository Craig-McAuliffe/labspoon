export const PHOTOS = 'photos';
export const VIDEOS = 'videos';
export const OPENPOSITIONS = 'openPositions';
export const RESEARCHFOCUSES = 'researchFocuses';
export const TECHNIQUES = 'techniques';
export const POSTS = 'posts';
export const IMAGES = 'images';
export const PUBLICATIONS = 'publications';
export const TOPICS = 'topics';
export const USERS = 'users';
export const GROUPS = 'groups';

export const OPENPOSITION = 'openPosition';
export const RESEARCHFOCUS = 'researchFocus';
export const TECHNIQUE = 'technique';
export const POST = 'post';
export const BOOKMARK = 'bookmark';
export const PUBLICATION = 'publication';
export const COMMENT = 'comment';
export const USER = 'user';
export const GROUP = 'group';
export const TOPIC = 'topic';
export const IMAGE = 'image';
export const VIDEO = 'video';
export const RECOMMENDATION = 'recommendation';
export const PHOTO = 'photo';

export function resourceTypeToCollection(resourceType) {
  switch (resourceType) {
    case POST:
      return POSTS;
    case TOPIC:
      return TOPICS;
    case USER:
      return USERS;
    case GROUP:
      return GROUPS;
    default:
      return undefined;
  }
}
