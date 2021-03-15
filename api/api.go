package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"reflect"
	"time"

	"cloud.google.com/go/datastore"
	"github.com/gorilla/mux"
	"google.golang.org/api/iterator"
)

type jsonResponse struct {
	Msg  string `json:"message"`
	Body string `json:"body"`
}

//for unmarshalling JSON to bools
type JSONBool bool

func (bit *JSONBool) UnmarshalJSON(b []byte) error {
	txt := string(b)
	*bit = JSONBool(txt == "1" || txt == "true")
	return nil
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
	Name        string `json:"name"`
	Email       string `json:"email"`
	AccountType string `json:"type"`
}

func (l User) String() string {
	r := ""
	v := reflect.ValueOf(l)
	typeOfL := v.Type()

	for i := 0; i < v.NumField(); i++ {
		r = r + fmt.Sprintf("%s: %v, ", typeOfL.Field(i).Name, v.Field(i).Interface())
	}
	return r
}

type Listing struct {
	UserID        string `json:"user"`
	OwnerID       string `json:"owner"`
	Name          string `json:"name"` // immutable once created, used for queries
	Address       string `json:"address"`
	Postcode      string `json:"postcode"`
	Area          string `json:"area"`
	Price         int    `json:"price"`
	PropertyType  int    `json:"propertyType"` // 0 = landed, 1 = apartment
	ListingType   int    `json:"listingType"`  // 0 = for rent, 1 = for sale
	ImgURL        string `json:"img"`
	AvailableDate string `json:"availableDate"`
	IsPublic      bool   `json:"isPublic"`
	IsCompleted   bool   `json:"isCompleted"`
	IsPending     bool   `json:"isPending"`
}

func (l Listing) String() string {
	r := ""
	v := reflect.ValueOf(l)
	typeOfL := v.Type()

	for i := 0; i < v.NumField(); i++ {
		r = r + fmt.Sprintf("%s: %v, ", typeOfL.Field(i).Name, v.Field(i).Interface())
	}
	return r
}

type newListingPostReq struct {
	Auth          string      `json:"auth"`
	UserID        string      `json:"user"`
	OwnerID       string      `json:"owner"`
	Name          string      `json:"name"`
	Address       string      `json:"address"`
	Postcode      string      `json:"postcode"`
	Area          string      `json:"area"`
	Price         json.Number `json:"price"`
	PropertyType  json.Number `json:"propertyType"` // 0 = landed, 1 = apartment
	ListingType   json.Number `json:"type"`         // 0 = for rent, 1 = for sale
	ImgURL        string      `json:"img"`
	AvailableDate string      `json:"availableDate"`
	IsPublic      JSONBool    `json:"isPublic"`
	IsCompleted   JSONBool    `json:"isCompleted"`
	IsPending     JSONBool    `json:"isPending"`
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

func createNewUserHandler(w http.ResponseWriter, r *http.Request) {
	var newUser User
	// decode data
	err := json.NewDecoder(r.Body).Decode(&newUser)
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

	kind := "User"
	name := time.Now().Format("2006-01-02_15:04:05_-0700")
	newUserKey := datastore.NameKey(kind, name, nil)

	if _, err := client.Put(ctx, newUserKey, &newUser); err != nil {
		log.Fatalf("Failed to save User: %v", err)
	}

	// return
	data := jsonResponse{
		Msg:  "Created " + newUserKey.String(),
		Body: newUser.String(),
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(data)
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
	name := time.Now().Format("2006-01-02_15:04:05_-0700")
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

	var query *datastore.Query
	isPublicParam := r.URL.Query()["isPublic"][0]
	if isPublicParam == "" {
		query = datastore.NewQuery("Listing").
			Filter("UserID =", r.URL.Query()["user"][0])
	} else {
		query = datastore.NewQuery("Listing").
			Filter("UserID =", r.URL.Query()["user"][0]).
			Filter("IsPublic =", isPublicParam)
	}
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
	name := time.Now().Format("2006-01-02_15:04:05_-0700")
	newListingKey := datastore.NameKey(kind, name, nil)
	price, _ := newListingReq.Price.Int64()
	pType, _ := newListingReq.PropertyType.Int64()
	lType, _ := newListingReq.ListingType.Int64()
	newListing := Listing{
		UserID:        newListingReq.UserID,
		OwnerID:       newListingReq.OwnerID,
		Name:          newListingReq.Name,
		Address:       newListingReq.Address,
		Postcode:      newListingReq.Postcode,
		Area:          newListingReq.Area,
		Price:         int(price),
		PropertyType:  int(pType),
		ListingType:   int(lType),
		ImgURL:        newListingReq.ImgURL,
		AvailableDate: newListingReq.AvailableDate,
		IsPublic:      bool(newListingReq.IsPublic),
		IsCompleted:   bool(newListingReq.IsCompleted),
		IsPending:     bool(newListingReq.IsPending),
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
	router.Methods("POST").Path("/user").HandlerFunc(createNewUserHandler)
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
