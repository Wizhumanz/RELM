import { writable } from 'svelte/store'

var user = (typeof window !== 'undefined') && (localStorage.getItem("user"))
  ? localStorage.getItem("user")
  : "";
export var storeUser = writable(user)
storeUser.subscribe(value => {
  if (typeof window !== 'undefined') {
    // strip images
    // let storeListings = [];
    // value.listings.forEach((l) => {
    //   l.imgs = []
    //   storeListings.push(l);
    // });
    // user.listings = storeListings;
    localStorage.setItem("user", value); //value already stringified before setting to store
  }
});

export var resetState = writable(false)
export var currentPage = writable('')