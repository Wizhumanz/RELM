<script>
  import {resetState,currentPage } from "../../store.js";
  export let id;
  export let listing = {};

  let showEdit = false
  let route
  let currentStatePublic = listing.isPublic
  let currentStateComplete = listing.isCompleted
  let currentStatePending = listing.isPending

  let owner = "";
  let name = "";
  let address = "";
  let postcode = "";
  let area = "";
  let Price = 0;
  let rentBuyOption;
  let PropertyType;
  let ListingType;
  let dateString;
  let isPublic = false;
  let isCompleted = false;
  let isPending = false;

  resetState.subscribe((newValue) => {
    if (newValue !== false) {
      currentStatePublic = listing.isPublic
      currentStateComplete = listing.isCompleted
      currentStatePending = listing.isPending
      resetState.set(false)
    }
  });

  currentPage.subscribe((newValue) => {
    if (newValue) {
      route = newValue
    }
  });
</script>


<div class="container" class:active={(currentStatePublic !== listing.isPublic) || (currentStateComplete !== listing.isCompleted) || (currentStatePending !== listing.isPending)}>
  <div class="row">
    <div class="col-2 d-flex justify-content-center">
      <h1><i class="bi bi-house-door" /></h1>
      <button on:click={() => showEdit = !showEdit}>Edit</button>
    </div>
    <div class="col-7">
      <h4>{listing.name}</h4>
      {#if !showEdit}
      <p>Address: {listing.address}</p>
      <p>Postcode: {listing.postcode}</p>
      <p>Area: {listing.area}</p>
      <p>
        Price: RM {listing.Price ? listing.Price
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}
      </p>
      <p>Rent/Buy: {listing.rentBuyOption}</p>
      <p>Property Type: {listing.PropertyType}</p>
      <p>Listing Type: {listing.ListingType}</p>
      <p>Owner: {listing.owner}</p>
      <a href={listing.imgsL}>View Images</a>
      <p>Available on: {listing.availableDate}</p>
      {:else}
      <label for="address">Address:</label>
      <input type="text" id="address" bind:value={listing.address}><br>
      <label for="postcode">Postcode: </label>
      <input type="text" id="postcode" bind:value={listing.postcode}><br>
      <label for="area">Area: </label>
      <input type="text" id="area" bind:value={listing.area}><br>
      <label for="price">Price: </label>
      <input type="text" id="price" bind:value={listing.Price}><br>
      <label for="rentBuy" class="form-label">Rent/Buy</label>
          <select id="rentBuy" class="form-select" bind:value={listing.rentBuyOption}>
            <option value="Rent">Rent</option>
            <option value="Buy">Buy</option>
          </select>
      <div class="mb-3">
        <label for="propertyType" class="form-label">Property Type</label>
        <select id="propertyType" class="form-select" bind:value={listing.PropertyType}>
          <option value="0">Landed</option>
          <option value="1">Apartment</option>
        </select>
      </div>
      <div class="mb-3">
          <label for="listingType" class="form-label">Listing Type</label>
          <select id="listingType" class="form-select" bind:value={listing.ListingType}>
            <option value="0">For Rent</option>
            <option value="1">For Sale</option>
          </select>
        </div>
      <label for="owner">Owner: </label>
      <input type="text" id="owner" bind:value={listing.owner}><br>
      <label for="date">Available on: </label>
      <input type="text" id="date" bind:value={listing.availableDate}><br>
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
