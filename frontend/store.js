import { writable } from 'svelte/store'
export var storeUser = writable('')
export var resetState = writable(false)
export var currentPage = writable('')