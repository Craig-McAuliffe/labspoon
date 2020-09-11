package users

import (
	"context"
	"fmt"

	"cloud.google.com/go/firestore"

	"labspoon.com/test/populateFirestore/topics"
)

/*
Used when referring to users from other types. Contains the necessary
information to display a user with their name and avatar, such as in the
header of a post or in a list.
*/
type UserRef struct {
	ID     string `firestore:"id,omitempty"`
	Name   string `firestore:"name,omitempty"`
	Avatar string `firestore:"avatar,omitempty"`
}

// Used when the full details about a user a required, such as on their profile
// page.
type User struct {
	ID         string `firestore:"id,omitempty"`
	Name       string `firestore:"name,omitempty"`
	Avatar     string `firestore:"avatar,omitempty"`
	CoverPhoto string `firestore:"coverPhoto,omitempty" yaml:"coverPhoto"`
	// TODO: Should embed a group ref
	MemberOfGroup string `firestore:"memberOfGroup,omitempty"`
	// TODO: Should embed a institution ref
	Institution     string                  `firestore:"institution,omitempty"`
	Topics          map[string]topics.Topic `yaml:"topics" firestore:"-"`
	FollowsUsers    map[string]UserRef      `yaml:"followsUsers" firestore:"-"`
	FollowsTopics   map[string]topics.Topic `yaml:"followsTopics" firestore:"-"`
	FollowedByUsers map[string]UserRef      `yaml:"followedByUsers" firestore:"-"`
}

// SetUsers creates the user collection, and sets users within it based on the
// User struct above. Additionally, it instantiates the following feed for the
// users.
func SetUsers(ctx context.Context, client *firestore.Client, users map[string]User) error {
	for id, user := range users {
		userDocumentRef := client.Collection("users").Doc(id)
		_, err := userDocumentRef.Set(ctx, user)
		if err != nil {
			return fmt.Errorf("Failed to add user with ID %v: %w", id, err)
		}
		err = setUserTopics(ctx, client, user)
		if err != nil {
			return fmt.Errorf("Failed to set topics for user with ID %v: %w", id, err)
		}
		err = setFollowsUsers(ctx, client, userDocumentRef, user.FollowsUsers)
		if err != nil {
			return fmt.Errorf("Failed to add follows users relationships for user with ID %v: %w", id, err)
		}
		err = setFollowsTopics(ctx, client, user, user.FollowsTopics)
		if err != nil {
			return fmt.Errorf("Failed to add follows topics relationships for user with ID %v: %w", id, err)
		}
		err = setFollowedByUsers(ctx, client, userDocumentRef, user.FollowedByUsers)
		if err != nil {
			return fmt.Errorf("Failed to add followed by users relationships for user with ID %v: %w", id, err)
		}
		err = instantiateFeeds(ctx, client, userDocumentRef, user.FollowedByUsers)
		if err != nil {
			return fmt.Errorf("Failed to add feeds for user with ID %v: %w", id, err)
		}
	}
	return nil
}

func setUserTopics(ctx context.Context, client *firestore.Client, user User) error {
	for id, topic := range user.Topics {
		batch := client.Batch()
		batch.Set(client.Collection("users").Doc(user.ID).Collection("topics").Doc(id), topic)
		batch.Set(client.Collection("topics").Doc(id).Collection("users").Doc(user.ID), userToUserRef(user))
		_, err := batch.Commit(ctx)
		if err != nil {
			return fmt.Errorf("Failed to add user topic relation for topic %v: %w", id, err)
		}
	}
	return nil
}

func setFollowsTopics(ctx context.Context, client *firestore.Client, user User, topics map[string]topics.Topic) error {
	for topicID, topic := range topics {
		batch := client.Batch()
		batch.Set(client.Collection("users").Doc(user.ID).Collection("followsTopics").Doc(topicID), topic)
		batch.Set(client.Collection("topics").Doc(topicID).Collection("followedByUsers").Doc(user.ID), userToUserRef(user))
		_, err := batch.Commit(ctx)
		if err != nil {
			return fmt.Errorf("Failed to add following relationship to topic with ID %v: %w", topicID, err)
		}
	}
	return nil
}

func setFollowsUsers(ctx context.Context, client *firestore.Client, userDocumentRef *firestore.DocumentRef, followsUsers map[string]UserRef) error {
	followsUsersDocumentRef := userDocumentRef.Collection("followsUsers")
	for id, followUser := range followsUsers {
		_, err := followsUsersDocumentRef.Doc(id).Set(ctx, followUser)
		if err != nil {
			return fmt.Errorf("Failed to add following relationship to user with ID %v: %w", id, err)
		}
	}
	return nil
}

func setFollowedByUsers(ctx context.Context, client *firestore.Client, userDocumentRef *firestore.DocumentRef, followedByUsers map[string]UserRef) error {
	followedByUsersDocumentRef := userDocumentRef.Collection("followedByUsers")
	for id, followedByUser := range followedByUsers {
		_, err := followedByUsersDocumentRef.Doc(id).Set(ctx, followedByUser)
		if err != nil {
			return fmt.Errorf("Failed to add followed by relationship to user with ID %v: %w", id, err)
		}
	}
	return nil
}

func instantiateFeeds(ctx context.Context, client *firestore.Client, userDocumentRef *firestore.DocumentRef, followedByUsers map[string]UserRef) error {
	feedRef := userDocumentRef.Collection("feeds")
	_, err := feedRef.Doc("followingFeed").Set(ctx, map[string]string{"id": "followingFeed"})
	if err != nil {
		return fmt.Errorf("Failed to create following feed document: %w", err)
	}
	return nil
}

func userToUserRef(user User) UserRef {
	return UserRef{
		ID:     user.ID,
		Name:   user.Name,
		Avatar: user.Avatar,
	}
}
