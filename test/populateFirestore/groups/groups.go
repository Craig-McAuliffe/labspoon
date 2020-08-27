package groups

import (
	"context"
	"fmt"

	"cloud.google.com/go/firestore"

	"labspoon.com/test/populateFirestore/posts"
	"labspoon.com/test/populateFirestore/topics"
)

type Group struct {
	Name        string         `firestore:"name,omitempty"`
	Location    string         `firestore:"location,omitempty"`
	Institution string         `firestore:"institution,omitempty"`
	Website     string         `firestore:"website,omitempty"`
	Avatar      string         `firestore:"avatar,omitempty"`
	About       string         `firestore:"about,omitempty"`
	PinnedPost  posts.Post     `firestore:"pinnedPost" yaml:"pinnedPost"`
	Topics      []topics.Topic `firestore:"-"`
	Photos      []Photo        `firestore:"-"`
}

type Photo struct {
	Src string `firestore:"src,omitempty"`
	Alt string `firestore:"alt,omitempty"`
}

func SetGroups(ctx context.Context, client *firestore.Client, groups map[string]Group) error {
	for id, group := range groups {
		groupDocRef := client.Collection("groups").Doc(id)
		_, err := groupDocRef.Set(ctx, group)
		if err != nil {
			return fmt.Errorf("Failed to add group with ID %v: %w", id, err)
		}
	}
	return nil
}
