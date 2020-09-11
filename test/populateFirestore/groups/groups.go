package groups

import (
	"context"
	"fmt"

	"cloud.google.com/go/firestore"

	"labspoon.com/test/populateFirestore/posts"
	"labspoon.com/test/populateFirestore/topics"
	"labspoon.com/test/populateFirestore/users"
)

type GroupRef struct {
	Name   string `firestore:"name,omitempty"`
	Avatar string `firestore:"avatar,omitempty"`
	About  string `firestore:"about,omitempty"`
}

type Group struct {
	Name        string                `firestore:"name,omitempty"`
	Location    string                `firestore:"location,omitempty"`
	Institution string                `firestore:"institution,omitempty"`
	Website     string                `firestore:"website,omitempty"`
	Avatar      string                `firestore:"avatar,omitempty"`
	About       string                `firestore:"about,omitempty"`
	PinnedPost  posts.Post            `firestore:"pinnedPost" yaml:"pinnedPost"`
	Members     []users.UserRef       `firestore:"-"`
	Topics      []topics.Topic        `firestore:"-"`
	Photos      []Photo               `firestore:"-"`
	Posts       map[string]posts.Post `firestore:"-"`
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
		err = setGroupMembers(ctx, client, id, group)
		if err != nil {
			return fmt.Errorf("Failed to set members for group with ID %v: %w", id, err)
		}
		err = setGroupTopics(ctx, client, id, group)
		if err != nil {
			return fmt.Errorf("Failed to set topics for group with ID %v: %w", id, err)
		}
		err = setGroupPosts(ctx, client, id, group)
		if err != nil {
			return fmt.Errorf("Failed to set posts for group with ID %v: %w", id, err)
		}
	}
	return nil
}

func setGroupPosts(ctx context.Context, client *firestore.Client, groupID string, group Group) error {
	for postID, post := range group.Posts {
		batch := client.Batch()
		batch.Set(client.Collection("groups").Doc(groupID).Collection("posts").Doc(postID), post)
		groupRef := GroupRef{
			Name:   group.Name,
			Avatar: group.Avatar,
			About:  group.About,
		}
		batch.Set(client.Collection("posts").Doc(postID).Collection("groups").Doc(groupID), groupRef)
		_, err := batch.Commit(ctx)
		if err != nil {
			return fmt.Errorf("Failed to add post with ID %v to group: %w", postID, err)
		}
	}
	return nil
}

func setGroupMembers(ctx context.Context, client *firestore.Client, groupID string, group Group) error {
	for _, member := range group.Members {
		_, err := client.Collection("groups").Doc(groupID).Collection("members").Doc(member.ID).Set(ctx, member)
		if err != nil {
			return fmt.Errorf("Failed to add member with ID %v to group with ID %v: %w", member.ID, groupID, err)
		}
		groupRef := GroupRef{
			Name:   group.Name,
			Avatar: group.Avatar,
			About:  group.About,
		}
		_, err = client.Collection("users").Doc(member.ID).Collection("groups").Doc(groupID).Set(ctx, groupRef)
		if err != nil {
			return fmt.Errorf("Failed to add member with ID %v to group with ID %v: %w", member.ID, groupID, err)
		}
	}
	return nil
}

func setGroupTopics(ctx context.Context, client *firestore.Client, groupID string, group Group) error {
	for _, topic := range group.Topics {
		batch := client.Batch()
		batch.Set(client.Collection("groups").Doc(groupID).Collection("topics").Doc(topic.ID), topic)
		groupRef := GroupRef{
			Name:   group.Name,
			Avatar: group.Avatar,
			About:  group.About,
		}
		batch.Set(client.Collection("topics").Doc(topic.ID).Collection("groups").Doc(groupID), groupRef)
		_, err := batch.Commit(ctx)
		if err != nil {
			return fmt.Errorf("Failed to add group topic relation for topic %v: %w", topic.ID, err)
		}
	}
	return nil
}
