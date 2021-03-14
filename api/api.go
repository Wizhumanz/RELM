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
	"github.com/gorilla/mux"
	"google.golang.org/api/iterator"
)

type jsonResponse struct {
	Msg  string `json:"message"`
	Body string `json:"body"`
}

type Owner struct {
	UserIDs []string
	Name    string
	Phone   string
	Email   string
}

func (o Owner) String() string {
	return o.Name + " / " + o.Phone + " / " + o.Email + " / <PARTIAL IDs>" + o.UserIDs[0]
}

type newOwnerPostReq struct {
	Name    string   `json:"name"`
	Phone   string   `json:"phone"`
	Email   string   `json:"email"`
	UserIDs []string `json:"userIDs"`
}

type User struct {
	Name  string
	Email string
}

type Listing struct {
	UserID        string `json:"user"`
	OwnerID       string `json:"owner"`
	Name          string `json:"name"` // immutable once created, used for queries
	Address       string `json:"address"`
	Postcode      string `json:"postcode"`
	Price         int    `json:"price"`
	ListingType   int    `json:"type"` // 0 = for rent, 1 = for sale
	ImgURL        string `json:"img"`
	AvailableDate string `json:"availableDate"`
}

func (l Listing) String() string {
	return l.Name + " / " + l.Address + " / " + l.Postcode
}

type newListingPostReq struct {
	UserID        string      `json:"user"`
	Auth          string      `json:"auth"`
	Name          string      `json:"name"`
	Address       string      `json:"address"`
	Postcode      string      `json:"postcode"`
	Price         json.Number `json:"price"`
	ListingType   json.Number `json:"type"` // 0 = for rent, 1 = for sale
	ImgURL        string      `json:"img"`
	AvailableDate string      `json:"availableDate"`
}

var googleProjectID = "myika-relm"
var fakeUserId = "1234567"

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

func getAllOwnersHandler(w http.ResponseWriter, r *http.Request) {
	ownersResp := make([]Owner, 0)

	// TODO: use real auth
	if a := os.Getenv("AUTH"); a != r.Header.Get("auth") {
		data := jsonResponse{Msg: "Authorization Invalid", Body: "Auth header invalid."}
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(data)
		return
	}

	ctx := context.Background()
	client, err := datastore.NewClient(ctx, googleProjectID)
	if err != nil {
		log.Fatalf("Failed to create client: %v", err)
	}

	fmt.Println(r.URL.Query()["user"][0])

	query := datastore.NewQuery("Owner").
		Filter("UserIDs =", r.URL.Query()["user"][0])
	t := client.Run(ctx, query)
	for {
		var x Owner
		_, err := t.Next(&x)
		if err == iterator.Done {
			break
		}
		if err != nil {
			// Handle error.
		}
		ownersResp = append(ownersResp, x)
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ownersResp)
}

func createNewOwnerHandler(w http.ResponseWriter, r *http.Request) {
	var newOwnerReq newOwnerPostReq

	// decode data
	err := json.NewDecoder(r.Body).Decode(&newOwnerReq)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// TODO: use real auth
	if a := os.Getenv("AUTH"); a != r.Header.Get("auth") {
		data := jsonResponse{Msg: "Authorization Invalid", Body: "Auth header invalid."}
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

	kind := "Owner"
	name := time.Now().Local().String() //id
	newOwnerKey := datastore.NameKey(kind, name, nil)
	newOwner := Owner{
		UserIDs: newOwnerReq.UserIDs, //TODO: handle past elements in array NOT replace
		Name:    newOwnerReq.Name,
		Phone:   newOwnerReq.Phone,
		Email:   newOwnerReq.Email,
	}

	if _, err := client.Put(ctx, newOwnerKey, &newOwner); err != nil {
		log.Fatalf("Failed to save Owner: %v", err)
	}

	// return
	data := jsonResponse{
		Msg:  "Created " + newOwnerKey.String(),
		Body: newOwner.String(),
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(data)
}

func getAllListingsHandler(w http.ResponseWriter, r *http.Request) {
	listingsResp := make([]Listing, 0)

	// TODO: use real auth
	if a := os.Getenv("AUTH"); a != r.Header.Get("auth") {
		data := jsonResponse{Msg: "Authorization Invalid", Body: "Auth header invalid."}
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(data)
		return
	}

	ctx := context.Background()
	client, err := datastore.NewClient(ctx, googleProjectID)
	if err != nil {
		log.Fatalf("Failed to create client: %v", err)
	}

	query := datastore.NewQuery("Listing").
		Filter("UserID =", r.URL.Query()["user"][0])
	t := client.Run(ctx, query)
	for {
		var x Listing
		_, err := t.Next(&x)
		if err == iterator.Done {
			break
		}
		if err != nil {
			// Handle error.
		}
		listingsResp = append(listingsResp, x)
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(listingsResp)
}

// almost identical logic with create and update (event sourcing)
func addListing(w http.ResponseWriter, r *http.Request) {
	var newListingReq newListingPostReq

	// decode data
	err := json.NewDecoder(r.Body).Decode(&newListingReq)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// TODO: use real auth
	if a := os.Getenv("AUTH"); a != r.Header.Get("auth") {
		data := jsonResponse{Msg: "Authorization Invalid", Body: "Auth header invalid."}
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
		UserID:      newListingReq.UserID,
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
	data := jsonResponse{
		Msg:  "Updated " + newListingKey.String(),
		Body: newListing.String(),
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(data)
}

func updateListingHandler(w http.ResponseWriter, r *http.Request) {
	// TODO: use listingName passed in URL to check if listing exists
	// TODO: don't allow name modification
	addListing(w, r)
}

func createNewListingHandler(w http.ResponseWriter, r *http.Request) {
	addListing(w, r)
}

func main() {
	router := mux.NewRouter().StrictSlash(true)
	router.Methods("GET").Path("/").HandlerFunc(indexHandler)
	router.Methods("GET").Path("/owners").HandlerFunc(getAllOwnersHandler)
	router.Methods("POST").Path("/owner").HandlerFunc(createNewOwnerHandler)
	router.Methods("GET").Path("/listings").HandlerFunc(getAllListingsHandler)
	router.Methods("POST").Path("/listing").HandlerFunc(createNewListingHandler)
	router.Methods("PUT").Path("/listing/{listingName}").HandlerFunc(updateListingHandler)

	auth := os.Getenv("AUTH")
	fmt.Println("AUTH var = " + auth)

	port := os.Getenv("PORT")
	fmt.Println("myikaco-api listening on port " + port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}
