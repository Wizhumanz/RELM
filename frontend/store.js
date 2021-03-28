import { writable } from 'svelte/store'

var user = typeof window !== 'undefined' ? localStorage.getItem("user") : "";
export var storeUser = writable(user)
storeUser.subscribe(user => {
  if (typeof window !== 'undefined' && user && user.listings) {
    // strip images
    let storeListings = [];
    user.listings.forEach((l) => {
      l.imgs = []
      storeListings.push(l);
    });
    user.listings = storeListings;
    localStorage.setItem("user", user); //value already stringified before setting to store
  }
});

export var resetState = writable(false)
export var currentPage = writable('')