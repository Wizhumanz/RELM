<script>
  import { resetState, currentPage, storeUser } from "../../store.js";
  import { onMount } from "svelte";
  import axios from "axios";

  export let id;
  export let listing;
  let user = {};
  storeUser.subscribe((newValue) => {
    if (newValue) {
      user = JSON.parse(newValue);
    }
  });
  let showEdit = false;
  let route;
  let currentStatePublic;
  let currentStateComplete;
  let currentStatePending;
  let checkBoxArr = []

  resetState.subscribe((newValue) => {
    if (newValue !== false) {
      currentStatePublic = listing.isPublic;
      currentStateComplete = listing.isCompleted;
      currentStatePending = listing.isPending;
      resetState.set(false);
    }
  });

  currentPage.subscribe((newValue) => {
    if (newValue) {
      route = newValue;
    }
  });

  onMount(async () => {
    currentStatePublic = listing.isPublic;
    currentStateComplete = listing.isCompleted;
    currentStatePending = listing.isPending;
  });

  const addListing = () => {
    showEdit = false
    let listingSubstitute = {...listing}
    listingSubstitute.name = null
    listingSubstitute.isPublic = listing.isPublic.toString()
    listingSubstitute.isPending = listing.isPending.toString()
    listingSubstitute.isCompleted = listing.isCompleted.toString()
    console.log(listingSubstitute)
    console.log(listing)
    const hds = {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Expires: "0",
      auth: "agent",
    };
    axios
      .put("https://relm-api.myika.co/listing/" + listing.name.replaceAll(" ", "+") + "?user=agent%40agent.com", 
      JSON.stringify(listingSubstitute), {
        headers: hds,
      })
      .then((res) => {
        console.log(res.status + " -- " + JSON.stringify(res.data));
        
        console.log("Before" + JSON.stringify(user.listings))
        user.listings.forEach((l) => {
          if (l.name == listing.name){
            l = listing
          }
        })
        storeUser.set(JSON.stringify(user));
        console.log("After" + JSON.stringify(user.listings))
      })
      .catch((error) => console.log(error.response) );
  }
  
</script>

<div
  class="container"
  class:active={currentStatePublic !== listing.isPublic ||
    currentStateComplete !== listing.isCompleted ||
    currentStatePending !== listing.isPending}
>
  <div class="row">
    <div class="col-2 d-flex justify-content-center">
      <h1><i class="bi bi-house-door" /></h1>
      <button disabled={showEdit} on:click={() => showEdit = true}>Edit</button>
    </div>
    <div class="col-7">
      <h4>{listing.name}</h4>
      {#if !showEdit}
        <p>Address: {listing.address}</p>
        <p>Postcode: {listing.postcode}</p>
        <p>Area: {listing.area}</p>
        <p>
          Price: RM {listing.price
            ? listing.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            : ""}
        </p>
        <p>Rent/Buy: {listing.rentBuyOption}</p>
        <p>Property Type: {listing.propertyType}</p>
        <p>Listing Type: {listing.listingType}</p>
        <p>Owner: {listing.owner}</p>
        <a href={listing.imgsL}>View Images</a>
        <p>Available on: {listing.availableDate}</p>
      {:else}
      <form class="form" on:submit|preventDefault={addListing}>
        <label for="address">Address:</label>
        <input type="text" id="address" bind:value={listing.address} /><br />
        <label for="postcode">Postcode: </label>
        <input type="text" id="postcode" bind:value={listing.postcode} /><br />
        <label for="area">Area: </label>
        <input type="text" id="area" bind:value={listing.area} /><br />
        <label for="price">Price: </label>
        <input type="text" id="price" bind:value={listing.price} /><br />
        <label for="rentBuy" class="form-label">Rent/Buy</label>
        <select
          id="rentBuy"
          class="form-select"
          bind:value={listing.rentBuyOption}
        >
          <option value="Rent">Rent</option>
          <option value="Buy">Buy</option>
        </select>
        <div class="mb-3">
          <label for="propertyType" class="form-label">Property Type</label>
          <select
            id="propertyType"
            class="form-select"
            bind:value={listing.propertyType}
          >
            <option value="0">Landed</option>
            <option value="1">Apartment</option>
          </select>
        </div>
        <div class="mb-3">
          <label for="listingType" class="form-label">Listing Type</label>
          <select
            id="listingType"
            class="form-select"
            bind:value={listing.listingType}
          >
            <option value="0">For Rent</option>
            <option value="1">For Sale</option>
          </select>
        </div>
        <label for="owner">Owner: </label>
        <input type="text" id="owner" bind:value={listing.owner} /><br />
        <label for="date">Available on: </label>
        <input type="text" id="date" bind:value={listing.availableDate} /><br />
        <button type="submit">Save</button>
      </form>
      {/if}
    </div>
    <div class="col-3">
      {#if id && id !== ""}
        <div class="form-check form-check-inline">
          <input
            class="form-check-input"
            type="checkbox"
            id="inlineCheckbox1"
            value="option1"
            bind:checked={listing.isPublic}
          />
        </div>

        {#if route !== "pending"}
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="checkbox"
              id="inlineCheckbox2"
              value="option2"
              bind:checked={listing.isCompleted}
            />
          </div>

          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="checkbox"
              id="inlineCheckbox3"
              value="option3"
            />
          </div>
        {:else}
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="checkbox"
              id="inlineCheckbox4"
              value="option2"
              bind:checked={listing.isPending}
            />
          </div>
        {/if}
      {:else}
        <button>Learn More</button>
      {/if}
    </div>
  </div>
  <hr />
</div>

<style type="text/scss">
  @import "../../static/styles/_all";
  div.container {
    font-family: $body-font;
    margin: 1.5rem auto;
    text-align: left;
    border-radius: 3px;

    p {
      margin: 0;
    }
  }

  input.form-check-input {
    margin: 1rem 0.75rem;
  }

  a {
    text-decoration: underline;
  }

  .active {
    background-color: red;
  }
</style>
