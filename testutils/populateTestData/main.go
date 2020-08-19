package main

import (
	"context"
	"fmt"
	"io/ioutil"
	"log"
	"time"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
	"gopkg.in/yaml.v3"
)

const mockDataFile = "./mockData.yaml"

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
	ID            string             `firestore:"id,omitempty"`
	Name          string             `firestore:"name,omitempty"`
	Avatar        string             `firestore:"avatar,omitempty"`
	FollowsUsers  map[string]UserRef `yaml:"followsUsers" firestore:"-"`
	FollowsTopics map[string]Topic   `yaml:"followsTopics" firestore:"-"`
}

type Topic struct {
	ID   string `firestore:"id,omitempty"`
	Name string `firestore:"name,omitempty"`
}

type PostType struct {
	ID   string `firestore:"id,omitempty"`
	Name string `firestore:"name,omitempty"`
}

type PostContent struct {
	Text string `firestore:"title,omitempty"`
}

type Post struct {
	ID        string      `firestore:"id,omitempty"`
	Title     string      `firestore:"title,omitempty"`
	PostType  PostType    `firestore:"postType" yaml:"postType"`
	Author    UserRef     `firestore:"author"`
	Content   PostContent `firestore:"content"`
	Topics    []Topic     `firestore:"topics"`
	Timestamp *time.Time  `firestore:"timestamp"`
}

type Data struct {
	Users  map[string]User
	Topics map[string]Topic
	Posts  map[string]Post
}

func getDataFromFile(filePath string) (Data, error) {
	var data Data
	fileData, err := ioutil.ReadFile(filePath)
	if err != nil {
		return data, fmt.Errorf("Failed to read test data file: %w", err)
	}
	err = yaml.Unmarshal(fileData, &data)
	if err != nil {
		return data, fmt.Errorf("Failed to unmarshal test data: %w", err)
	}
	return data, nil
}

func setFollowsTopics(ctx context.Context, client *firestore.Client, userDocumentRef *firestore.DocumentRef, followsTopics map[string]Topic) error {
	followsTopicsDocumentRef := userDocumentRef.Collection("followsTopics")
	for id, followTopic := range followsTopics {
		_, err := followsTopicsDocumentRef.Doc(id).Set(ctx, followTopic)
		if err != nil {
			return fmt.Errorf("Failed to add following relationship to topic with ID %v: %w", id, err)
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

func setUsers(ctx context.Context, client *firestore.Client, users map[string]User) error {
	for id, user := range users {
		userDocumentRef := client.Collection("users").Doc(id)
		_, err := userDocumentRef.Set(ctx, user)
		if err != nil {
			return fmt.Errorf("Failed to add user with ID %v: %w", id, err)
		}
		err = setFollowsUsers(ctx, client, userDocumentRef, user.FollowsUsers)
		if err != nil {
			return fmt.Errorf("Failed to add follows users relationships for user with ID %v: %w", id, err)
		}
		err = setFollowsTopics(ctx, client, userDocumentRef, user.FollowsTopics)
		if err != nil {
			return fmt.Errorf("Failed to add follows topics relationships for user with ID %v: %w", id, err)
		}
	}
	return nil
}

func setTopics(ctx context.Context, client *firestore.Client, topics map[string]Topic) error {
	for id, topic := range topics {
		_, err := client.Collection("topics").Doc(id).Set(ctx, topic)
		if err != nil {
			return fmt.Errorf("Failed to add topic with ID %v: %w", id, err)
		}
	}
	return nil
}

func setPosts(ctx context.Context, client *firestore.Client, posts map[string]Post) error {
	for id, post := range posts {
		_, err := client.Collection("posts").Doc(id).Set(ctx, post)
		// add to the author's posts
		authorID := post.Author.ID
		_, err = client.Collection("users").Doc(authorID).Collection("posts").Doc(id).Set(ctx, post)
		if err != nil {
			return fmt.Errorf("Failed to add post %v to author %v 's posts: %w", id, authorID, err)
		}
		// set on the topic posts
		for _, topic := range post.Topics {
			_, err := client.Collection("topics").Doc(topic.ID).Collection("posts").Doc(id).Set(ctx, post)
			if err != nil {
				return fmt.Errorf("Failed to add post %v to topic %v posts: %w", id, topic.ID, err)
			}
		}
		// add to following feeds of relevant users
		// TODO(patrick)
	}
	return nil
}

func populate(ctx context.Context, client *firestore.Client, data Data) error {
	err := setUsers(ctx, client, data.Users)
	if err != nil {
		return fmt.Errorf("Failed to set users: %w", err)
	}
	err = setTopics(ctx, client, data.Topics)
	if err != nil {
		return fmt.Errorf("Failed to set topics: %w", err)
	}
	err = setPosts(ctx, client, data.Posts)
	if err != nil {
		return fmt.Errorf("Failed to set topics: %w", err)
	}
	return nil
}

func main() {
	ctx := context.Background()
	config := &firebase.Config{
		ProjectID: "labspoon-dev-266bc",
	}
	app, err := firebase.NewApp(ctx, config)
	if err != nil {
		log.Fatalln(err)
	}
	client, err := app.Firestore(ctx)
	if err != nil {
		log.Fatalln(err)
	}
	defer client.Close()
	data, err := getDataFromFile(mockDataFile)
	if err != nil {
		log.Fatalln(err)
	}
	err = populate(ctx, client, data)
	if err != nil {
		log.Fatalln(err)
	}
}
