package topics

import (
	"context"
	"fmt"

	"cloud.google.com/go/firestore"
)

type Topic struct {
	ID   string `firestore:"id,omitempty"`
	Name string `firestore:"name,omitempty"`
}

// SetTopics creates the topic collection and the topic documents within it.
func SetTopics(ctx context.Context, client *firestore.Client, topics map[string]Topic) error {
	for id, topic := range topics {
		_, err := client.Collection("topics").Doc(id).Set(ctx, topic)
		if err != nil {
			return fmt.Errorf("Failed to add topic with ID %v: %w", id, err)
		}
	}
	return nil
}
