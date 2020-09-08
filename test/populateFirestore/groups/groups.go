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
	Name        string          `firestore:"name,omitempty"`
	Location    string          `firestore:"location,omitempty"`
	Institution string          `firestore:"institution,omitempty"`
	Website     string          `firestore:"website,omitempty"`
	Avatar      string          `firestore:"avatar,omitempty"`
	About       string          `firestore:"about,omitempty"`
	PinnedPost  posts.Post      `firestore:"pinnedPost" yaml:"pinnedPost"`
	Members     []users.UserRef `firestore:"-"`
	Topics      []topics.Topic  `firestore:"-"`
	Photos      []Photo         `firestore:"-"`
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
