package posts

import (
	"context"
	"fmt"
	"time"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"

	"labspoon.com/test/populateFirestore/topics"
	"labspoon.com/test/populateFirestore/users"
)

type Post struct {
	ID        string         `firestore:"id,omitempty"`
	Title     string         `firestore:"title,omitempty"`
	PostType  PostType       `firestore:"postType" yaml:"postType"`
	Author    users.UserRef  `firestore:"author"`
	Content   PostContent    `firestore:"content"`
	Topics    []topics.Topic `firestore:"topics"`
	Timestamp *time.Time     `firestore:"timestamp"`
}

type PostType struct {
	ID   string `firestore:"id,omitempty"`
	Name string `firestore:"name,omitempty"`
}

type PostContent struct {
	Text string `firestore:"title,omitempty"`
}

// SetPosts sets posts to all relevant collections of posts.
func SetPosts(ctx context.Context, client *firestore.Client, posts map[string]Post) error {
	for id, post := range posts {
		authorID := post.Author.ID
		_, err := client.Collection("posts").Doc(id).Set(ctx, post)
		if err != nil {
			return fmt.Errorf("Failed to add post %v to posts collection: %w", id, authorID, err)
		}

		_, err = client.Collection("users").Doc(post.Author.ID).Collection("posts").Doc(id).Set(ctx, post)
		if err != nil {
			return fmt.Errorf("Failed to add post %v to author %v 's posts: %w", id, authorID, err)
		}

		for _, topic := range post.Topics {
			_, err := client.Collection("topics").Doc(topic.ID).Collection("posts").Doc(id).Set(ctx, post)
			if err != nil {
				return fmt.Errorf("Failed to add post %v to topic %v posts: %w", id, topic.ID, err)
			}
		}
		err = setPostToFollowedByUsers(ctx, client, authorID, post)
		if err != nil {
			return fmt.Errorf("Failed to add post %v to author %v 's follower's following feeds: %w", id, authorID, err)
		}
	}

	return nil
}

func setPostToFollowedByUsers(ctx context.Context, client *firestore.Client, authorID string, post Post) error {
	followedByUsersIter := client.Collection("users").Doc(authorID).Collection("followedByUsers").Documents(ctx)
	for {
		followedByUserDoc, err := followedByUsersIter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return fmt.Errorf("Failed to get followed by user document for user %v: %w", authorID, err)
		}
		var followedByUser users.UserRef
		followedByUserDoc.DataTo(&followedByUser)
		followedByUserRef := client.Collection("users").Doc(followedByUser.ID)
		followingFeedRef := followedByUserRef.Collection("feeds").Doc("followingFeed")
		_, err = followingFeedRef.Collection("posts").Doc(post.ID).Set(ctx, post)
		if err != nil {
			return fmt.Errorf("Failed to set post on following feed for user %v: %w", followedByUser.ID, err)
		}
	}
	return nil
}
