package main

import (
	"context"
	"flag"
	"fmt"
	"io/ioutil"
	"log"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
	"google.golang.org/api/option"
	"gopkg.in/yaml.v3"

	"labspoon.com/test/populateFirestore/groups"
	"labspoon.com/test/populateFirestore/posts"
	"labspoon.com/test/populateFirestore/publications"
	"labspoon.com/test/populateFirestore/topics"
	"labspoon.com/test/populateFirestore/users"
)

var envFlag = flag.String("environment", "local", "Environment to target the populate script at; either local or dev.")

const mockDataFile = "./mockData.yaml"

type Data struct {
	Users        map[string]users.User
	Topics       map[string]topics.Topic
	Posts        map[string]posts.Post
	Groups       map[string]groups.Group
	Publications map[string]publications.Publication
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
	err = groups.SetGroups(ctx, client, data.Groups)
	if err != nil {
		return fmt.Errorf("Failed to set groups: %w", err)
	}
	err = posts.SetPosts(ctx, client, data.Posts)
	if err != nil {
		return fmt.Errorf("Failed to set topics: %w", err)
	}
	err = publications.SetPublications(ctx, client, data.Publications)
	if err != nil {
		return fmt.Errorf("Failed to set topics: %w", err)
	}
	return nil
}

func main() {
	flag.Parse()
	fmt.Println(*envFlag)
	ctx := context.Background()
	var app *firebase.App
	var err error
	if *envFlag == "dev" {
		fmt.Println("dev")
		sa := option.WithCredentialsFile("./serviceAccount.json")
		app, err = firebase.NewApp(ctx, nil, sa)
	} else if *envFlag == "local" {
		fmt.Println("local")
		config := &firebase.Config{
			ProjectID: "labspoon-dev-266bc",
		}
		app, err = firebase.NewApp(ctx, config)
	} else {
		log.Fatalln("Invalid environment flag")
	}
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
