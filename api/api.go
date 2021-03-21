package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"reflect"
	"strings"
	"time"

	"cloud.google.com/go/datastore"
	"cloud.google.com/go/storage"
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
	KEY           string   `json:"KEY"`
	UserID        string   `json:"user"`
	OwnerID       string   `json:"owner"`
	Name          string   `json:"name"` // immutable once created, used for queries
	Address       string   `json:"address"`
	Postcode      string   `json:"postcode"`
	Area          string   `json:"area"`
	Price         int      `json:"price,string"`
	PropertyType  int      `json:"propertyType,string"` // 0 = landed, 1 = apartment
	ListingType   int      `json:"listingType,string"`  // 0 = for rent, 1 = for sale
	Imgs          []string `json:"imgs"`
	AvailableDate string   `json:"availableDate"`
	IsPublic      bool     `json:"isPublic,string"`
	IsCompleted   bool     `json:"isCompleted,string"`
	IsPending     bool     `json:"isPending,string"`
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
	w.Header().Set("Content-Type", "application/json")
	if r.Method != "GET" {
		data = jsonResponse{Msg: "Only GET Allowed", Body: "This endpoint only accepts GET requests."}
		w.WriteHeader(http.StatusUnauthorized)
		return
	} else {
		data = jsonResponse{Msg: "RELM API", Body: "Ready"}
		w.WriteHeader(http.StatusOK)
	}
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

	//only need to authenticate if not fetching public listings
	if len(r.URL.Query()["isPublic"]) == 0 && !authenticateUser(authReq) {
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
		key, err := t.Next(&x)
		if key != nil {
			x.KEY = key.Name
		}
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
func addListing(w http.ResponseWriter, r *http.Request, isPutReq bool, listingToUpdate Listing) {
	var newListing Listing

	// decode data
	err := json.NewDecoder(r.Body).Decode(&newListing)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	authReq := loginReq{
		Email:    newListing.UserID,
		Password: r.Header.Get("auth"),
	}
	// for PUT req, user already authenticated outside this function
	if !isPutReq && !authenticateUser(authReq) {
		data := jsonResponse{Msg: "Authorization Invalid", Body: "Go away."}
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(data)
		return
	}

	// if updating listing, don't allow Name change
	if isPutReq && (newListing.Name != "") {
		data := jsonResponse{Msg: "Name property of Listing is immutable.", Body: "Do not pass Name property in request body."}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(data)
		return
	}

	// TODO: fill empty PUT listing fields

	//save images in new bucket
	ctx := context.Background()
	clientStorage, err := storage.NewClient(ctx)
	if err != nil {
		log.Fatalf("Failed to create client: %v", err)
	}

	//use listing ID as bucket name
	newListingName := time.Now().Format("2006-01-02_15:04:05_-0700")
	//format for proper bucket name
	bucketName := strings.ReplaceAll(newListingName, ":", "-") //url.QueryEscape(newListing.UserID + "." + newListing.Name)
	bucketName = strings.ReplaceAll(bucketName, "+", "plus")
	bucket := clientStorage.Bucket(bucketName)
	ctx, cancel := context.WithTimeout(ctx, time.Second*10)
	defer cancel()
	if err := bucket.Create(ctx, googleProjectID, nil); err != nil {
		log.Fatalf("Failed to create bucket: %v", err)
	}

	for j, strImg := range newListing.Imgs {
		fmt.Println(strImg)
		//convert image from base64 string to JPEG
		i := strings.Index(strImg, ",")
		if i < 0 {
			fmt.Println("img in body no comma")
		}

		//store img in new bucket
		dec := base64.NewDecoder(base64.StdEncoding, strings.NewReader(strImg[i+1:])) // pass reader to NewDecoder
		// Upload an object with storage.Writer.
		wc := clientStorage.Bucket(bucketName).Object(fmt.Sprintf("%d", j)).NewWriter(ctx)
		if _, err = io.Copy(wc, dec); err != nil {
			fmt.Printf("io.Copy: %v", err)
		}
		if err := wc.Close(); err != nil {
			fmt.Printf("Writer.Close: %v", err)
		}
	}
	newListing.Imgs = []string{bucketName} //just store bucket name, objects retrieved on getListing

	// create new listing in DB
	clientAdd, err := datastore.NewClient(ctx, googleProjectID)
	if err != nil {
		log.Fatalf("Failed to create client: %v", err)
	}

	kind := "Listing"
	newListingKey := datastore.NameKey(kind, newListingName, nil)

	if _, err := clientAdd.Put(ctx, newListingKey, &newListing); err != nil {
		log.Fatalf("Failed to save Listing: %v", err)
	}

	// return
	data := jsonResponse{
		Msg:  "Added " + newListingKey.String(),
		Body: newListing.String(),
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(data)
}

func updateListingHandler(w http.ResponseWriter, r *http.Request) {
	//check if listing already exists to update
	putID, unescapeErr := url.QueryUnescape(mux.Vars(r)["id"]) //is actually Listing.Name, not __key__ in Datastore
	if unescapeErr != nil {
		data := jsonResponse{Msg: "Listing ID Parse Error", Body: unescapeErr.Error()}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(data)
		return
	}
	listingsResp := make([]Listing, 0)

	//auth
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

	//get listing with ID
	ctx := context.Background()
	client, err := datastore.NewClient(ctx, googleProjectID)
	if err != nil {
		log.Fatalf("Failed to create client: %v", err)
	}

	query := datastore.NewQuery("Listing").
		Filter("Name =", putID)

	t := client.Run(ctx, query)
	for {
		var x Listing
		key, err := t.Next(&x)
		if key != nil {
			x.KEY = key.Name
		}
		if err == iterator.Done {
			break
		}
		if err != nil {
			// Handle error.
		}
		listingsResp = append(listingsResp, x)
	}

	//return if listing to update doesn't exist
	putIDValid := len(listingsResp) > 0 && listingsResp[0].Address != ""
	if !putIDValid {
		data := jsonResponse{Msg: "Listing ID Invalid", Body: "Listing with provided Name does not exist."}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(data)
		return
	}

	addListing(w, r, true, listingsResp[0])
}

func createNewListingHandler(w http.ResponseWriter, r *http.Request) {
	addListing(w, r, false, Listing{}) //empty Listing struct passed just for compiler
}

func main() {
	router := mux.NewRouter().StrictSlash(true)
	router.Methods("GET").Path("/").HandlerFunc(indexHandler)
	router.Methods("POST").Path("/login").HandlerFunc(loginHandler)
	router.Methods("POST").Path("/user").HandlerFunc(createNewUserHandler)
	router.Methods("POST").Path("/owner").HandlerFunc(createNewUserHandler)
	router.Methods("GET").Path("/listings").HandlerFunc(getAllListingsHandler)
	router.Methods("POST").Path("/listing").HandlerFunc(createNewListingHandler)
	router.Methods("PUT").Path("/listing/{id}").HandlerFunc(updateListingHandler)

	port := os.Getenv("PORT")
	fmt.Println("relm-api listening on port " + port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}
