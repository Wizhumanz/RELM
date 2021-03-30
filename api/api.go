package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
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
	PhoneNumber string `json:"phone"`
}

type TwilioReq struct {
	OwnerNumber string `json:"owner"`
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
	KEY           string   `json:"KEY,omitempty"`
	UserID        string   `json:"user"`
	OwnerID       string   `json:"owner"`
	Name          string   `json:"name"` // immutable once created, used for queries
	Address       string   `json:"address"`
	Postcode      string   `json:"postcode"`
	Area          string   `json:"area"`
	Price         int      `json:"price,string"`
	PropertyType  int      `json:"propertyType,string"` // 0 = landed, 1 = apartment
	ListingType   int      `json:"listingType,string"`  // 0 = for rent, 1 = for sale
	AvailableDate string   `json:"availableDate"`
	IsPublic      bool     `json:"isPublic,string"`
	IsCompleted   bool     `json:"isCompleted,string"`
	IsPending     bool     `json:"isPending,string"`
	Imgs          []string `json:"imgs"`
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

var googleProjectID = "myika-relm"
var client *datastore.Client
var ctx context.Context

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

func deleteElement(sli []Listing, del Listing) []Listing {
	var rSli []Listing
	for _, e := range sli {
		if e.KEY != del.KEY {
			rSli = append(rSli, e)
		}
	}
	return rSli
}

type checkerFunc func(Listing) bool

func GetIndex(s []Listing, chk checkerFunc) int {
	for i, li := range s {
		if chk(li) {
			return i
		}
	}
	return 0
}

func setupCORS(w *http.ResponseWriter, req *http.Request) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
}

// route handlers

func getUserHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("working")
	user := r.URL.Query().Get("owner")
	if user == "" {
		//Handle error.
	}

	var userWithEmail User
	query := datastore.NewQuery("User").
		Filter("Email =", user)
	t := client.Run(ctx, query)
	_, error := t.Next(&userWithEmail)
	if error != nil {
		// Handle error.
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(userWithEmail)
}

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
	setupCORS(&w, r)
	if (*r).Method == "OPTIONS" {
		return
	}

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
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
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
	setupCORS(&w, r)
	if (*r).Method == "OPTIONS" {
		return
	}

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

	//run query, decode listings to obj and store in slice
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

	//if no listings, return empty array
	if len(listingsResp) == 0 {
		w.WriteHeader(http.StatusOK)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(listingsResp)
	}

	//sum up event sourcing for listings
	var existingListingsArr []Listing
	for _, li := range listingsResp {
		//find listing in existing listings array
		var exListing Listing
		for i := range existingListingsArr {
			if existingListingsArr[i].Name == li.Name {
				exListing = existingListingsArr[i]
			}
		}
		//if listings already exists, remove one
		if exListing.Name != "" {
			//compare date keys
			layout := "2006-01-02_15:04:05_-0700"
			existingTime, _ := time.Parse(layout, exListing.KEY)
			currentLITime, _ := time.Parse(layout, li.KEY)
			//if existing is older, remove and add newer current listing; otherwise, do nothing
			if existingTime.Before(currentLITime) {
				//rm existing listing
				existingListingsArr = deleteElement(existingListingsArr, exListing)
				//append current listing
				existingListingsArr = append(existingListingsArr, li)
			}
		} else {
			existingListingsArr = append(existingListingsArr, li)
		}
	}
	listingsResp = existingListingsArr

	//only get images for some listings
	var imgFetchListings []Listing
	var startAtID string //lazy loading
	if len(listingsResp) > 0 && len(r.URL.Query()["startID"]) > 0 {
		//start fetching images from last ID passed by client
		startAtID = r.URL.Query()["startID"][0]
		indexOfStartID := GetIndex(listingsResp, func(l Listing) bool {
			return l.KEY == startAtID
		})
		imgFetchListings = listingsResp[indexOfStartID:]
	} else if len(listingsResp) > 0 {
		respLen := len(listingsResp)
		if respLen > 4 {
			respLen = 4
			imgFetchListings = listingsResp[:respLen]
		} else {
			imgFetchListings = listingsResp
		}
	}

	//cloud storage connection config
	storageClient, _ := storage.NewClient(ctx)
	defer storageClient.Close()
	ctx, cancel := context.WithTimeout(ctx, time.Second*10)
	defer cancel()
	//get images from cloud storage buckets
	var imgFilledListings []Listing = []Listing{}
	for _, li := range imgFetchListings {
		imgArr := li.Imgs
		if len(imgArr) <= 0 {
			continue
		}
		bkt := li.Imgs[0]

		//list all objects in bucket
		var objNames []string = []string{}
		it := storageClient.Bucket(bkt).Objects(ctx, nil)
		for {
			attrs, err := it.Next()
			if err == iterator.Done {
				break
			}
			if err != nil {
				// return fmt.Errorf("Bucket(%q).Objects: %v", bkt, err)
			}
			if attrs != nil {
				objNames = append(objNames, attrs.Name)
			} else {
				break
			}
		}

		//download first img, set as new img property for listing (decoded on client side)
		var imgStrs []string
		if len(objNames) > 0 {
			obj := objNames[0]
			rc, _ := storageClient.Bucket(bkt).Object(obj).NewReader(ctx)
			defer rc.Close()

			imgByteArr, _ := ioutil.ReadAll(rc)
			imgStrs = append(imgStrs, base64.StdEncoding.EncodeToString(imgByteArr))
		}

		// old GET all
		// for _, obj := range objNames {
		// 	rc, err := client.Bucket(bkt).Object(obj).NewReader(ctx)
		// 	if err != nil {
		// 		// return nil, fmt.Errorf("Object(%q).NewReader: %v", obj, err)
		// 	}
		// 	defer rc.Close()

		// 	imgByteArr, err := ioutil.ReadAll(rc)
		// 	if err != nil {
		// 		// return nil, fmt.Errorf("ioutil.ReadAll: %v", err)
		// 	}
		// 	imgStrs = append(imgStrs, base64.StdEncoding.EncodeToString(imgByteArr))
		// }

		li.Imgs = imgStrs
		imgFilledListings = append(imgFilledListings, li)
	}
	//build resp array
	var finalResp []Listing
	for _, li := range listingsResp {
		//determine if current listing just got filled with imgs
		filledListing := Listing{}
		for _, f := range imgFilledListings {
			if f.KEY == li.KEY {
				filledListing = f
			}
		}
		//return filled img listings
		if filledListing.Name != "" {
			finalResp = append(finalResp, filledListing)
		} else {
			finalResp = append(finalResp, li)
		}
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(finalResp)
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
	// if updating, name field not passed in JSON body, so must fill
	if isPutReq {
		newListing.Name = listingToUpdate.Name
	}

	// TODO: fill empty PUT listing fields

	//must have images to POST new listing
	if !isPutReq && len(newListing.Imgs) <= 0 {
		data := jsonResponse{Msg: "No images found in body.", Body: "At least one image must be included to create a new listing."}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(data)
		return
	}
	//save images in new bucket on POST only
	ctx := context.Background()
	//use listing ID as bucket name
	newListingName := time.Now().Format("2006-01-02_15:04:05_-0700")
	if !isPutReq {
		clientStorage, err := storage.NewClient(ctx)
		if err != nil {
			log.Fatalf("Failed to create client: %v", err)
		}

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
	} else {
		newListing.Imgs = listingToUpdate.Imgs
	}

	// create new listing in DB
	kind := "Listing"
	newListingKey := datastore.NameKey(kind, newListingName, nil)

	if _, err := client.Put(ctx, newListingKey, &newListing); err != nil {
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
	query := datastore.NewQuery("Listing").
		Filter("Name =", putID)
	t := client.Run(ctx, query)
	for {
		var x Listing
		key, err := t.Next(&x)
		if err == iterator.Done {
			break
		}
		if err != nil {
			// Handle error.
		}

		if key != nil {
			x.KEY = key.Name
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

	addListing(w, r, true, listingsResp[len(listingsResp)-1])
}

func createNewListingHandler(w http.ResponseWriter, r *http.Request) {
	addListing(w, r, false, Listing{}) //empty Listing struct passed just for compiler
}

func getOwnerNumberHandler(w http.ResponseWriter, r *http.Request) {

	accountSid := "ACa59451c872071e8037cf59811057fd21"
	authToken := "3b6a2f39bb05f5214283ef7bd6db973f"
	urlStr := "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json"
	var twilioReq TwilioReq

	err := json.NewDecoder(r.Body).Decode(&twilioReq)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	v := url.Values{}
	v.Set("To", twilioReq.OwnerNumber)
	v.Set("From", "+15076160092")
	v.Set("Body", "Brooklyn's in the house!")
	rb := *strings.NewReader(v.Encode())

	// Create Client
	client := &http.Client{}
	req, _ := http.NewRequest("POST", urlStr, &rb)
	req.SetBasicAuth(accountSid, authToken)
	req.Header.Add("Accept", "application/json")
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	resp, _ := client.Do(req)
	fmt.Println(resp.Status)
}

func main() {
	//init
	ctx = context.Background()
	var err error
	client, err = datastore.NewClient(ctx, googleProjectID)
	if err != nil {
		log.Fatalf("Failed to create client: %v", err)
	}

	router := mux.NewRouter().StrictSlash(true)
	router.Methods("GET").Path("/").HandlerFunc(indexHandler)
	router.Methods("POST", "OPTIONS").Path("/login").HandlerFunc(loginHandler)
	router.Methods("POST").Path("/user").HandlerFunc(createNewUserHandler)
	router.Methods("GET").Path("/owner").HandlerFunc(getUserHandler)
	router.Methods("GET", "OPTIONS").Path("/listings").HandlerFunc(getAllListingsHandler)
	router.Methods("POST").Path("/listing").HandlerFunc(createNewListingHandler)
	router.Methods("PUT").Path("/listing/{id}").HandlerFunc(updateListingHandler)
	router.Methods("POST").Path("/twilio").HandlerFunc(getOwnerNumberHandler)

	port := os.Getenv("PORT")
	fmt.Println("relm-api listening on port " + port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}
