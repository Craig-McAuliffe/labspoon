package posts

import (
	"context"
	"fmt"
	"time"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"

	"labspoon.com/test/populateFirestore/filters"
	"labspoon.com/test/populateFirestore/topics"
	"labspoon.com/test/populateFirestore/users"
)

type Post struct {
	ID               string         `firestore:"id,omitempty"`
	Title            string         `firestore:"title,omitempty"`
	PostType         PostType       `firestore:"postType" yaml:"postType"`
	Author           users.UserRef  `firestore:"author"`
	Content          PostContent    `firestore:"content"`
	Topics           []topics.Topic `firestore:"topics"`
	Timestamp        *time.Time     `firestore:"timestamp"`
	FilterPostTypeID string         `firestore:"filter_postType_id"`
	FilterAuthorID   string         `firestore:"filter_author_id"`
	FilterTopicIDs   []string       `firestore:"filter_topic_ids"`
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
		populatePostIDFields(&post)
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

func populatePostIDFields(post *Post) {
	post.FilterPostTypeID = post.PostType.ID
	post.FilterAuthorID = post.Author.ID
	post.FilterTopicIDs = make([]string, len(post.Topics))
	for i, topic := range post.Topics {
		post.FilterTopicIDs[i] = topic.ID
	}
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
		err = updateFiltersByPost(ctx, followingFeedRef, post)
		if err != nil {
			return fmt.Errorf("Failed to update filters on following feed for user %v: %w", followedByUser.ID, err)
		}
	}
	return nil
}

// updateFiltersByPost updates the filters on a feed when a new post is added.
func updateFiltersByPost(ctx context.Context, feedRef *firestore.DocumentRef, post Post) error {
	err := updateFilterCollection(
		ctx,
		feedRef,
		&filters.FilterCollection{
			ResourceName: "Post Type",
			ResourceType: "postType",
		},
		&filters.FilterOption{
			Name:       post.PostType.Name,
			ResourceID: post.PostType.ID,
		},
	)
	if err != nil {
		return fmt.Errorf("Failed to update post type filter collection for post %v: %w", post, err)
	}
	err = updateFilterCollection(
		ctx,
		feedRef,
		&filters.FilterCollection{
			ResourceName: "Author",
			ResourceType: "user",
		},
		&filters.FilterOption{
			Name:       post.Author.Name,
			Avatar:     post.Author.Avatar,
			ResourceID: post.Author.ID,
		},
	)
	if err != nil {
		return fmt.Errorf("Failed to update author filter collection for post %v: %w", post, err)
	}
	for _, topic := range post.Topics {
		err = updateFilterCollection(
			ctx,
			feedRef,
			&filters.FilterCollection{
				ResourceName: "Topics",
				ResourceType: "topic",
			},
			&filters.FilterOption{
				Name:       topic.Name,
				ResourceID: topic.ID,
			},
		)
		if err != nil {
			return fmt.Errorf("Failed to update author filter collection for post %v: %w", post, err)
		}
	}
	return nil
}

func updateFilterCollection(ctx context.Context, feedRef *firestore.DocumentRef, filterCollection *filters.FilterCollection, filterOption *filters.FilterOption) error {
	filterCollectionRef, err := filters.CheckFilterCollectionExistsOrCreate(ctx, feedRef, filterCollection)
	if err != nil {
		return fmt.Errorf("Unable to retrieve filter collection: %w", err)
	}
	filterOptionRef, err := filters.CheckFilterOptionExistsOrCreate(ctx, filterCollectionRef, filterOption)
	if err != nil {
		return fmt.Errorf("Unable to retrieve filter option: %w", err)
	}
	filterOptionRef.Update(ctx, []firestore.Update{
		{Path: "rank", Value: firestore.Increment(1)},
	})
	if err != nil {
		return fmt.Errorf("Failed to update filter option rank for %v %v: %w", filterCollection.ResourceType, filterCollection.ResourceName, err)
	}
	return nil
}
