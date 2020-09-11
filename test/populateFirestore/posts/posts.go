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
	ID        string         `firestore:"id,omitempty"`
	Title     string         `firestore:"title,omitempty"`
	PostType  PostType       `firestore:"postType" yaml:"postType"`
	Author    users.UserRef  `firestore:"author"`
	Content   PostContent    `firestore:"content"`
	Topics    []topics.Topic `firestore:"topics"`
	Timestamp *time.Time     `firestore:"timestamp"`
	// Fields used for filtering results
	FilterPostTypeID string   `firestore:"filter_postType_id"`
	FilterAuthorID   string   `firestore:"filter_author_id"`
	FilterTopicIDs   []string `firestore:"filter_topic_ids"`
}

type PostType struct {
	ID   string `firestore:"id,omitempty"`
	Name string `firestore:"name,omitempty"`
}

type PostContent struct {
	Text        string          `firestore:"text,omitempty"`
	Location    string          `firestore:"location,omitempty"`
	Methods     []string        `firestore:"methods,omitempty"`
	StartDate   string          `firestore:"startDate,omitempty" yaml:"startDate"`
	Salary      string          `firestore:"salary,omitempty"`
	Funder      string          `firestore:"funder,omitempty"`
	Amount      string          `firestore:"amount,omitempty"`
	Researchers []users.UserRef `firestore:"researchers,omitempty"`
}

// SetPosts sets posts to all relevant collections of posts.
func SetPosts(ctx context.Context, client *firestore.Client, posts map[string]Post) error {
	for postID, post := range posts {
		authorID := post.Author.ID
		populatePostFilterFields(&post)
		_, err := client.Collection("posts").Doc(postID).Set(ctx, post)
		if err != nil {
			return fmt.Errorf("Failed to add post %v to posts collection: %w", postID, err)
		}
		_, err = client.Collection("users").Doc(post.Author.ID).Collection("posts").Doc(postID).Set(ctx, post)
		if err != nil {
			return fmt.Errorf("Failed to add post %v to author %v's posts: %w", postID, authorID, err)
		}
		for _, topic := range post.Topics {
			_, err := client.Collection("topics").Doc(topic.ID).Collection("posts").Doc(postID).Set(ctx, post)
			if err != nil {
				return fmt.Errorf("Failed to add post %v to topic %v posts: %w", postID, topic.ID, err)
			}
			err = setPostToTopicFollowedBy(ctx, client, topic.ID, post)
			if err != nil {
				return fmt.Errorf("Failed to add post %v to topic %v's followers' posts: %w", postID, topic.ID, err)
			}
		}
		err = setPostToFollowedByUsers(ctx, client, authorID, post)
		if err != nil {
			return fmt.Errorf("Failed to add post %v to author %v 's follower's following feeds: %w", postID, authorID, err)
		}
	}
	return nil
}

func populatePostFilterFields(post *Post) {
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

func setPostToTopicFollowedBy(ctx context.Context, client *firestore.Client, topicID string, post Post) error {
	topicDocRef := client.Collection("topics").Doc(topicID)
	err := updateFollowersFollowingFeedsWithPost(ctx, client, topicDocRef, post)
	if err != nil {
		return fmt.Errorf("Failed to update followers of topic with ID %v: %w", topicID, err)
	}
	return nil
}

func updateFollowersFollowingFeedsWithPost(ctx context.Context, client *firestore.Client, following *firestore.DocumentRef, post Post) error {
	followedByUsersIter := following.Collection("followedByUsers").Documents(ctx)
	for {
		followedByUserDoc, err := followedByUsersIter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return fmt.Errorf("Failed to get followed by user document: %w", err)
		}
		var followedByUser users.UserRef
		followedByUserDoc.DataTo(&followedByUser)
		followingFeedRef := client.Collection("users").Doc(followedByUser.ID).Collection("feeds").Doc("followingFeed")
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
