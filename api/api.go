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
	"golang.org/x/crypto/bcrypt"
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

type loginReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type User struct {
	Name        string `json:"name"`
	Email       string `json:"email"`
	AccountType string `json:"type"`
	Password    string `json:"password"`
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

// helper funcs

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 2)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func authenticateUser(req loginReq) bool {
	// get user with email
	ctx := context.Background()
	client, err := datastore.NewClient(ctx, googleProjectID)
	if err != nil {
		log.Fatalf("Failed to create client: %v", err)
	}

	var userWithEmail User
	query := datastore.NewQuery("User").
		Filter("Email =", req.Email)
	t := client.Run(ctx, query)
	_, error := t.Next(&userWithEmail)
	if error != nil {
		// Handle error.
	}

	// check password hash and return
	return CheckPasswordHash(req.Password, userWithEmail.Password)
}

// route handlers

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

func loginHandler(w http.ResponseWriter, r *http.Request) {
	var newLoginReq loginReq
	// decode data
	err := json.NewDecoder(r.Body).Decode(&newLoginReq)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var data jsonResponse
	if authenticateUser(newLoginReq) {
		data = jsonResponse{
			Msg:  "Successfully logged in!",
			Body: newLoginReq.Email,
		}
		w.WriteHeader(http.StatusCreated)
	} else {
		data = jsonResponse{
			Msg:  "Authentication failed.",
			Body: newLoginReq.Email,
		}
		w.WriteHeader(http.StatusUnauthorized)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func createNewUserHandler(w http.ResponseWriter, r *http.Request) {
	var newUser User
	// decode data
	err := json.NewDecoder(r.Body).Decode(&newUser)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	// set password hash
	newUser.Password, _ = HashPassword(newUser.Password)

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
		Msg:  "Set " + newUserKey.String(),
		Body: newUser.String(),
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(data)
}

func getAllListingsHandler(w http.ResponseWriter, r *http.Request) {
	listingsResp := make([]Listing, 0)

	authReq := loginReq{
		Email:    r.URL.Query()["user"][0],
		Password: r.Header.Get("auth"),
	}
	if !authenticateUser(authReq) {
		data := jsonResponse{Msg: "Authorization Invalid", Body: "Go away."}
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
	userIDParam := r.URL.Query()["user"][0]
	var isPublicParam = true //default
	if len(r.URL.Query()["isPublic"]) > 0 {
		//extract correct isPublic param
		isPublicQueryStr := r.URL.Query()["isPublic"][0]
		if isPublicQueryStr == "true" {
			isPublicParam = true
		} else if isPublicQueryStr == "false" {
			isPublicParam = false
		}

		query = datastore.NewQuery("Listing").
			Filter("UserID =", userIDParam).
			Filter("IsPublic =", isPublicParam)
	} else {
		query = datastore.NewQuery("Listing").
			Filter("UserID =", userIDParam)
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

	authReq := loginReq{
		Email:    newListingReq.UserID,
		Password: r.Header.Get("auth"),
	}
	if !authenticateUser(authReq) {
		data := jsonResponse{Msg: "Authorization Invalid", Body: "Go away."}
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
	router.Methods("POST").Path("/login").HandlerFunc(loginHandler)
	router.Methods("POST").Path("/user").HandlerFunc(createNewUserHandler)
	router.Methods("POST").Path("/owner").HandlerFunc(createNewUserHandler)
	router.Methods("GET").Path("/listings").HandlerFunc(getAllListingsHandler)
	router.Methods("POST").Path("/listing").HandlerFunc(createNewListingHandler)
	router.Methods("PUT").Path("/listing/{listingName}").HandlerFunc(updateListingHandler)

	auth := os.Getenv("AUTH")
	fmt.Println("AUTH var = " + auth)

	port := os.Getenv("PORT")
	fmt.Println("relm-api listening on port " + port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}
