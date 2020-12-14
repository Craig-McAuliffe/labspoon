// Retrieves paginated posts from the passed post collection using the last
// post of the previous page as a cursor. Returns a promise that returns an
// array of results when resolved. If there are no results, or the collection
// does not exist, an empty array of results is returned.
export function getPaginatedPostsFromCollectionRef(
  postCollection,
  limit,
  last
) {
  if (typeof last !== 'undefined') {
    postCollection = postCollection.startAt(last.timestamp);
  }
  return postCollection
    .limit(limit)
    .get()
    .then((qs) => postsQSToJSPosts(qs))
    .catch((err) => console.log(err));
}

// Optional fields are stored in the content of the post, however the post component expects them
// in an optional tags field.
export function translateOptionalFields(posts) {
  return posts.map((post) => translateOptionalField(post));
}

export function translateOptionalField(post) {
  Object.entries(post.content).forEach((value) => {
    let [type, content] = value;
    if (type === 'text') return;
    if (type === 'researchers') type = 'researcher';
    if (!post.hasOwnProperty('optionaltags') || post.optionaltags.length === 0)
      post.optionaltags = [];
    post.optionaltags.push({
      type: type,
      content: content,
    });
  });
  return post;
}

export function postsQSToJSPosts(qs) {
  const posts = [];
  qs.forEach((doc) => {
    posts.push(postDSToJSPost(doc));
  });
  return posts;
}

function postDSToJSPost(ds) {
  const post = ds.data();
  post.resourceType = 'post';
  post.id = ds.id;
  return post;
}
