package main

import (
	// "fmt"
	"os"
	"testing"
)

type testPair struct {
	Input    interface{}
	Expected interface{}
}

var testData []testPair

func setup() {
	testData := testPair{
		testPair{Input: []int{1, 5, 6, 3, 9}, Expected: []int{1, 5, 6, 3}},
	}
}

func shutdown() {

}

func TestMain(m *testing.M) {
	setup()
	code := m.Run()
	shutdown()
	os.Exit(code)
}

func TestDeleteElement(t *testing.T) {

}
