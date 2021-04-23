package main

import (
	"fmt"
	"net/http"
	"strconv"

	"cloud.google.com/go/datastore"
	"golang.org/x/crypto/bcrypt"
)

func setupCORS(w *http.ResponseWriter, req *http.Request) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Content-Type", "text/html; charset=utf-8")
	//(*w).Header().Set("Access-Control-Expose-Headers", "Authorization")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, auth, Cache-Control, Pragma, Expires")
}

// helper funcs

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 2)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func authenticateUser(req loginReq) (bool, User) {
	// get user with id/email
	var userWithEmail User
	var query *datastore.Query
	if req.Email != "" {
		query = datastore.NewQuery("User").
			Filter("Email =", req.Email)
	} else if req.ID != "" {
		i, _ := strconv.Atoi(req.ID)
		key := datastore.IDKey("User", int64(i), nil)
		query = datastore.NewQuery("User").
			Filter("__key__ =", key)
	} else {
		return false, User{}
	}

	t := client.Run(ctx, query)
	_, error := t.Next(&userWithEmail)
	if error != nil {
		fmt.Println(error.Error())
	}
	fmt.Println(userWithEmail)
	// check password hash and return
	return CheckPasswordHash(req.Password, userWithEmail.Password), userWithEmail
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
