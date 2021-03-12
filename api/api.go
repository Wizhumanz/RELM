package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

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

type Listing struct {
	Name        string `json:"name"` // immutable once created, used for queries
	Address     string `json:"address"`
	Postcode    string `json:"postcode"`
	Price       int    `json:"price"`
	ListingType int    `json:"type"` // 0 = for rent, 1 = for sale
	ImgURL      string `json:"img"`
}

func (l Listing) String() string {
	return l.Name + " / " + l.Address + " / " + l.Postcode
}

type newListingPostReq struct {
	Auth        string      `json:"auth"`
	Name        string      `json:"name"`
	Address     string      `json:"address"`
	Postcode    string      `json:"postcode"`
	Price       json.Number `json:"price"`
	ListingType json.Number `json:"type"` // 0 = for rent, 1 = for sale
	ImgURL      string      `json:"img"`
}

var googleProjectID = "myika-relm"

func indexHandler(w http.ResponseWriter, r *http.Request) {
	var data jsonResponse
	if r.Method != "GET" {
		data = jsonResponse{Msg: "Only GET Allowed", Body: "This endpoint only accepts GET requests."}
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	data = jsonResponse{Msg: "RELM API", Body: "Ready"}
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
	// w.Write([]byte(`{"msg": "привет сука"}`))
}

func createNewListing(w http.ResponseWriter, r *http.Request) {
	var data jsonResponse
	var newListingReq newListingPostReq

	if r.Method != "POST" {
		data = jsonResponse{Msg: "Only POST Allowed", Body: "This endpoint only accepts POST requests."}
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(data)
		return
	}

	// decode data
	err := json.NewDecoder(r.Body).Decode(&newListingReq)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// TODO: check real auth
	auth := os.Getenv("AUTH")
	if auth != newListingReq.Auth {
		data = jsonResponse{Msg: "Authorization Invalid", Body: "Auth field value from body invalid."}
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(data)
		return
	}

	// create new listing in DB
	ctx := context.Background()
	client, err := datastore.NewClient(ctx, googleProjectID)
	if err != nil {
		log.Fatalf("Failed to create client: %v", err)
	}

	kind := "Listing"
	name := time.Now().Local().String() //id
	newListingKey := datastore.NameKey(kind, name, nil)
	price, _ := newListingReq.Price.Int64()
	lType, _ := newListingReq.ListingType.Int64()
	newListing := Listing{
		Name:        newListingReq.Name,
		Address:     newListingReq.Address,
		Postcode:    newListingReq.Postcode,
		Price:       int(price),
		ListingType: int(lType),
		ImgURL:      newListingReq.ImgURL,
	}

	if _, err := client.Put(ctx, newListingKey, &newListing); err != nil {
		log.Fatalf("Failed to save Listing: %v", err)
	}

	// return
	data = jsonResponse{
		Msg:  "Saved " + newListingKey.String(),
		Body: newListing.String(),
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(data)
}

func main() {
	muxRouter := http.NewServeMux()
	muxRouter.HandleFunc("/", indexHandler)
	muxRouter.HandleFunc("/listing", createNewListing)

	auth := os.Getenv("AUTH")
	fmt.Println("AUTH var = " + auth)

	port := os.Getenv("PORT")
	fmt.Println("myikaco-api listening on port " + port)
	log.Fatal(http.ListenAndServe(":"+port, muxRouter))
}
