package publications

import (
	"context"
	"fmt"
	"time"

	"cloud.google.com/go/firestore"

	"labspoon.com/test/populateFirestore/topics"
	"labspoon.com/test/populateFirestore/users"
)

type Publication struct {
	ID        string          `firestore:"id,omitempty"`
	Title     string          `firestore:"title,omitempty"`
	Authors   []users.UserRef `firestore:"authors"`
	URL       string          `firestore:"url,omitempty"`
	Abstract  string          `firestore:"abstract,omitempty"`
	Topics    []topics.Topic  `firestore:"topics"`
	Timestamp *time.Time      `firestore:"timestamp"`
}

func SetPublications(ctx context.Context, client *firestore.Client, publications map[string]Publication) error {
	for id, publication := range publications {
		_, err := client.Collection("publications").Doc(id).Set(ctx, publication)
		if err != nil {
			return fmt.Errorf("Failed to add publication %v to publications collection: %w", id, err)
		}
		for _, author := range publication.Authors {
			_, err := client.Collection("users").Doc(author.ID).Collection("publications").Doc(id).Set(ctx, publication)
			if err != nil {
				return fmt.Errorf("Failed to add publication %v to author %v's publications: %w", id, author.ID, err)
			}
		}
	}
	return nil
}
