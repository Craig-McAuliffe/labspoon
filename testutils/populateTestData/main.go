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

type User struct {
	ID     string `firestore:"id,omitempty"`
	Name   string `firestore:"name,omitempty"`
	Avatar string `firestore:"avatar,omitempty"`
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
	Author    User        `firestore:"author"`
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

func setUsers(ctx context.Context, client *firestore.Client, users map[string]User) error {
	for id, user := range users {
		_, err := client.Collection("users").Doc(id).Set(ctx, user)
		if err != nil {
			return fmt.Errorf("Failed to add user with ID %v: %w", id, err)
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
