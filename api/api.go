package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"cloud.google.com/go/datastore"
)

type jsonResponse struct {
	Msg  string `json:"message"`
	Body string `json:"body"`
}

type jsonEmailPostRequest struct {
	Auth  string
	Email string
}

type User struct {
	Name  string
	Email string
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	// var data jsonResponse
	// if r.Method != "GET" {
	// 	data = jsonResponse{Msg: "Only GET Allowed", Body: "This endpoint only accepts GET requests."}
	// 	w.WriteHeader(http.StatusUnauthorized)
	// } else {
	// 	data = jsonResponse{Msg: "привет сука", Body: "курица - дерьмо"}
	// 	w.WriteHeader(http.StatusOK)
	// }

	// w.Header().Set("Content-Type", "application/json")
	// json.NewEncoder(w).Encode(data)
	// // w.Write([]byte(`{"msg": "привет сука"}`))

	ctx := context.Background()

	// Set your Google Cloud Platform project ID.
	projectID := "myika-relm"

	// Creates a client.
	client, err := datastore.NewClient(ctx, projectID)
	if err != nil {
		log.Fatalf("Failed to create client: %v", err)
	}

	// Sets the kind for the new entity.
	kind := "User"
	// Sets the name/ID for the new entity.
	name := "user0"
	// Creates a Key instance.
	newUserKey := datastore.NameKey(kind, name, nil)

	// Creates a Task instance.
	newUser := User{
		Name:  "Mika Yeap",
		Email: "mika@myika.co",
	}

	// Saves the new entity.
	if _, err := client.Put(ctx, newUserKey, &newUser); err != nil {
		log.Fatalf("Failed to save User: %v", err)
	}

	fmt.Printf("Saved %v: %v\n", newUserKey, newUser.Name+" - "+newUser.Email)
}

func createNewArticle(w http.ResponseWriter, r *http.Request) {
	var data jsonResponse
	if r.Method != "POST" {
		data = jsonResponse{Msg: "Only POST Allowed", Body: "This endpoint only accepts POST requests."}
		w.WriteHeader(http.StatusUnauthorized)
	} else {
		// decode data
		var emailReq jsonEmailPostRequest
		err := json.NewDecoder(r.Body).Decode(&emailReq)
		if err != nil || emailReq.Auth == "" || emailReq.Email == "" {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// check emailReq.Auth with env var
		auth := os.Getenv("AUTH")
		if auth != emailReq.Auth {
			data = jsonResponse{Msg: "Authorization Invalid", Body: "Auth field value from body invalid."}
			w.WriteHeader(http.StatusUnauthorized)
		} else {
			//TODO: do something
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func main() {
	muxRouter := http.NewServeMux()
	muxRouter.HandleFunc("/", indexHandler)
	muxRouter.HandleFunc("/email", createNewArticle)

	auth := os.Getenv("AUTH")
	fmt.Println("AUTH var = " + auth)

	port := os.Getenv("PORT")
	fmt.Println("myikaco-api listening on port " + port)
	log.Fatal(http.ListenAndServe(":"+port, muxRouter))
}
