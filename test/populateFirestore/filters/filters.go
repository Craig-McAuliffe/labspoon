package filters

import (
	"context"
	"fmt"

	"cloud.google.com/go/firestore"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type FilterCollection struct {
	ResourceName string         `firestore:"resourceName"`
	ResourceType string         `firestore:"resourceType"`
	Options      []FilterOption `firestore:"-"`
	// descending ranking of the filter collections used to order display of
	// filter collections on front end
	Rank int `firestore:"rank"`
}

type FilterOption struct {
	Name       string `firestore:"name"`
	Avatar     string `firestore:"avatar,omitempty"`
	ResourceID string `firestore:"resourceID"`
	// descending ranking of the filter collections used to order display of
	// filter option on front end
	Rank int `firestore:"rank"`
}

// CheckFilterCollectionExistsOrCreate checks whether there is a filter
// collection defined on the feed, and, if not, creates it.
func CheckFilterCollectionExistsOrCreate(ctx context.Context, feedRef *firestore.DocumentRef, filterCollection *FilterCollection) (*firestore.DocumentRef, error) {
	filterCollectionRef := feedRef.Collection("filterCollections").Doc(filterCollection.ResourceType)
	_, err := filterCollectionRef.Get(ctx)
	if status.Code(err) == codes.NotFound {
		_, err := filterCollectionRef.Set(ctx, filterCollection)
		if err != nil {
			return nil, fmt.Errorf("Unable to set filter collection for %v: %w", filterCollection.ResourceName, err)
		}
	} else if err != nil {
		return nil, fmt.Errorf("Unable to retrieve filter collection for %v: %w", filterCollection.ResourceName, err)
	}
	return filterCollectionRef, nil
}

// CheckFilterOptionExistsOrCreate checks whether there is a specific filter
// option in the corresponding filter collection, and, if not, creates it.
func CheckFilterOptionExistsOrCreate(ctx context.Context, filterCollectionRef *firestore.DocumentRef, filterOption *FilterOption) (*firestore.DocumentRef, error) {
	var filterOptionsDocRef = filterCollectionRef.Collection("filterOptions").Doc(filterOption.ResourceID)
	_, err := filterOptionsDocRef.Set(ctx, filterOption)
	if err != nil {
		return nil, fmt.Errorf("Unable to set filter option: %w", err)
	}
	return filterOptionsDocRef, nil
}
