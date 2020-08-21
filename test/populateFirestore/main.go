package main

import (
	"context"
	"fmt"
	"io/ioutil"
	"log"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
	"gopkg.in/yaml.v3"

	"labspoon.com/test/populateFirestore/posts"
	"labspoon.com/test/populateFirestore/topics"
	"labspoon.com/test/populateFirestore/users"
)

const mockDataFile = "./mockData.yaml"

type Data struct {
	Users  map[string]users.User
	Topics map[string]topics.Topic
	Posts  map[string]posts.Post
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

func populate(ctx context.Context, client *firestore.Client, data Data) error {
	err := users.SetUsers(ctx, client, data.Users)
	if err != nil {
		return fmt.Errorf("Failed to set users: %w", err)
	}
	err = topics.SetTopics(ctx, client, data.Topics)
	if err != nil {
		return fmt.Errorf("Failed to set topics: %w", err)
	}
	err = posts.SetPosts(ctx, client, data.Posts)
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
