package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
)

type jsonResponse struct {
	Msg  string `json:"message"`
	Body string `json:"body"`
}

type jsonEmailPostRequest struct {
	Auth  string
	Email string
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	var data jsonResponse
	if r.Method != "GET" {
		data = jsonResponse{Msg: "Only GET Allowed", Body: "This endpoint only accepts GET requests."}
		w.WriteHeader(http.StatusUnauthorized)
	} else {
		data = jsonResponse{Msg: "привет сука", Body: "курица - дерьмо"}
		w.WriteHeader(http.StatusOK)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
	// w.Write([]byte(`{"msg": "привет сука"}`))
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
