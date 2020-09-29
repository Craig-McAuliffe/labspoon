// Retrieves paginated user references from passed user reference collection
// for use in results pages. Returns a promise that returns an array of results
// when resolved. If there are no results, or the collection does not exist, an
// empty array of results is returned.
export function getPaginatedRecommendationsFromCollectionRef(
  recommendationsCollection,
  limit,
  last
) {
  if (typeof last !== 'undefined') {
    recommendationsCollection = recommendationsCollection.startAt(last.id);
  }
  //   console.log(recommendationsCollection);
  return recommendationsCollection
    .limit(limit)
    .get()
    .then((qs) => {
      const recommendations = [];
      qs.forEach((doc) => {
        const recommendation = doc.data();
        recommendations.push(recommendation.recommendedResourceData);
      });
      return recommendations;
    });
}
