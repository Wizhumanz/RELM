<script>
  import { resetState, currentPage, storeUser } from "../../store.js";
  import { createEventDispatcher, onMount } from "svelte";
  import axios from "axios";

  const dispatch = createEventDispatcher();
  let mainURL = "https://relm-api.myika.co"
  // let mainURL = "http://localhost:8000"

  let route;
  currentPage.subscribe((newValue) => {
    if (newValue) {
      route = newValue;
    }
  });

  let user = {};
  storeUser.subscribe((newValue) => {
    if (newValue) {
      user = JSON.parse(newValue);
    }
  });

  let owner = {
    name: "",
    email: "",
    phone: "",
  };

  export let id;
  export let listing;
  export var checkBoxArr = [];
  let showEdit = false;
  let showDownloadingIcon = false;
  let currentStatePublic;
  let currentStateComplete;
  let currentStatePending;
  let active = false;

  resetState.subscribe((newValue) => {
    if (newValue !== false) {
      currentStatePublic = listing.isPublic;
      currentStateComplete = listing.isCompleted;
      currentStatePending = listing.isPending;
      resetState.set(false);
    }
  });

  currentStatePublic = listing.isPublic;
  currentStateComplete = listing.isCompleted;
  currentStatePending = listing.isPending;

  onMount(async () => {
    if (listing.imgs && listing.imgs.length > 0) {
      //only set image src if it's the actual img base64 string
      let listOfImgs = []
      listing.imgs.forEach((i) => {
        if (i.length > 35) {
        let newImage = document.createElement("img");
        newImage.src = "data:image/jpeg;base64," + i;
        newImage.style.maxWidth = "100%";
        newImage.style.maxHeight = "auto";
        listOfImgs.push(newImage.outerHTML);
        } else {
          showDownloadingIcon = true;
        }
      })
      document.getElementById(listing.name.split(" ").join("")).innerHTML = listOfImgs;
    }
  });

  const updateListing = () => {
    showEdit = false;
    let listingSubstitute = { ...listing };
    listingSubstitute.isPublic = listing.isPublic.toString();
    listingSubstitute.isPending = listing.isPending.toString();
    listingSubstitute.isCompleted = listing.isCompleted.toString();
    const hds = {
      auth: "agent",
    };
    axios
      .put(
        mainURL + "/listing/" +
          listing.AggregateID +
          "?user=" + user.id, listingSubstitute,
        {
          headers: hds,
          mode: "cors",
        }
      )
      .then((res) => {
        console.log(res.status + " -- " + JSON.stringify(res.data));

        // console.log("Before" + JSON.stringify(user.listings))
        let storeListings = [];
        if (user.listings.length > 0) {
          Array.from(user.listings).forEach((l) => {
            if (l.AggregateID == listing.AggregateID) {
              storeListings.push(listing);
            } else {
              storeListings.push(l);
            }
          });
        }
        user.listings = storeListings;
        storeUser.set(JSON.stringify(user));
      })
      .catch((error) => console.log(error.response));
  };

  //if fields mismatch, set active
  $: if (
    currentStatePublic !== listing.isPublic ||
    currentStateComplete !== listing.isCompleted ||
    currentStatePending !== listing.isPending
  ) {
    active = true;
    checkBoxArr.push(listing.name);
    dispatch("checkedChange", {
      arr: checkBoxArr,
    });
  }
  //if fields match, set as inactive
  $: if (
    currentStatePublic === listing.isPublic &&
    currentStateComplete === listing.isCompleted &&
    currentStatePending === listing.isPending
  ) {
    active = false;
    let index = checkBoxArr ? checkBoxArr.indexOf(listing.name) : -1;
    if (index >= 0) {
      checkBoxArr.splice(index);
      dispatch("checkedChange", {
        arr: checkBoxArr,
      });
    }
  }

  async function checkAvailability() {
    const hds = {
      auth: "agent",
    };
    getOwnerInfo(user.id);
    setTimeout(function () {
      let data = {
        owner: listing.owner,
        message:
          `Hi ${listing.owner}, this is ${owner.name}.` +
          ` Just wanted to ask you if your property at ${listing.address} is still available?` +
          ` Please text, WhatsApp, or call me at ${owner.phone} to reply.` +
          " Notification sent automatically from relm.myika.co.",
      };
    }, 500);
    axios
      .post(mainURL + "/twilio", data, {
        headers: hds,
        mode: "cors",
      })
      .then((res) => {
        console.log(res.status + " -- " + JSON.stringify(res.data));
      })
      .catch((error) => console.log(error.response));
  }

  function getOwnerInfo(ownerEmail) {
    const hds = {
      auth: "agent",
    };
    axios
      .get(
        mainURL + "/owner?owner=" +
          ownerEmail.replaceAll("@", "%40"),
        {
          headers: hds,
          mode: "cors",
        }
      )
      .then((res) => {
        console.log(res.status + " -- " + JSON.stringify(res.data));
        owner.name = res.data.name;
        owner.email = res.data.email;
        owner.phone = res.data.phone;
      })
      .catch((error) => console.log(error.response));
  }

</script>

<div class="container" class:active>
  <div class="row">
    <div class="col-5" style="background-color:none;">
      <div id={listing.name ? listing.name.split(" ").join("") : ""}>
        {#if showDownloadingIcon}
          <h1><i class="bi bi-cloud-arrow-down" /></h1>
        {/if}
      </div>
    </div>
    <div class="col-4">
      {#if !showEdit}
        <h4>{listing.name} {active ? "<UNSAVED>" : ""}</h4>
        {#if route && route !== ""}
          <p>Address: {listing.address}</p>
        {/if}
        <p>Postcode: {listing.postcode}</p>
        <p>Area: {listing.area}</p>
        <p>
          Price: RM {listing.price
            ? listing.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            : ""}
        </p>
        <p>
          Property Type: {listing.propertyType === "1" ? "Apartment" : "Landed"}
        </p>
        <p>
          Listing Type: {listing.listingType === "1" ? "For Sale" : "For Rent"}
        </p>
        {#if id && id !== ""}
          <p>
            Owner:
            <a
              data-bs-toggle="collapse"
              href={listing.name
                ? "#ownerInfo" + listing.KEY
                : ""}
              role="button"
              aria-expanded="false"
              aria-controls="collapseExample"
              on:click|once={getOwnerInfo(listing.owner)}
            >
              Show info
            </a>
          </p>
          <div
            class="collapse indent"
            id={listing.name
              ? "ownerInfo" + listing.KEY
              : ""}
          >
            <p>{owner.name}</p>
            <p>{owner.email}</p>
            <p>{owner.phone}</p>
          </div>
        {/if}
        {#if route && route !== ""}
          <p>Available on: {listing.availableDate}</p>
        {/if}
        <!-- svelte-ignore a11y-missing-attribute -->
        {#if id && id !== ""}
          <a
            class="smallLink"
            disabled={showEdit}
            on:click={() => (showEdit = true)}>Edit</a
          >
        {/if}
      {:else}
        <form class="form" on:submit|preventDefault={updateListing}>
          <label for="address">Name: </label>
          <input type="text" id="address" bind:value={listing.name} /><br />
          <label for="address">Address: </label>
          <input type="text" id="address" bind:value={listing.address} /><br />
          <label for="postcode">Postcode: </label>
          <input type="text" id="postcode" bind:value={listing.postcode} /><br
          />
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
          <label for="date">Available on: </label>
          <input type="text" id="date" bind:value={listing.availableDate} /><br
          />
          <button type="submit">Save</button>
        </form>
      {/if}
    </div>
    <div class="col-3" style="background-color:none;">
      {#if id && id !== ""}
        <div class="form-check form-check-inline">
          <input
            class="form-check-input"
            type="checkbox"
            id="inlineCheckbox1"
            value="option1"
            bind:checked={listing.isPublic}
          />
          <p>Public</p>
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
            <p>Completed</p>
          </div>

          <div class="form-check form-check-inline">
            <button on:click={checkAvailability}>Check Availability</button>
          </div>
          <!-- svelte-ignore a11y-missing-attribute -->
          <a class="smallLink" on:click={() => console.log("iProperty")}>Publish on iProperty</a>
          <!-- svelte-ignore a11y-missing-attribute -->
          <a class="smallLink" on:click={() => console.log("PropertyGuru")}>Publish on PropertyGuru</a>
        {:else}
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="checkbox"
              id="inlineCheckbox4"
              value="option2"
              bind:checked={listing.isPending}
            />
            <p>Pending</p>
          </div>
        {/if}
      {:else}
        <button>Learn More</button>
      {/if}
    </div>
  </div>
</div>

<style type="text/scss">
  @import "../../static/styles/_all";

  div.container {
    font-family: $body-font;
    padding: 1rem 1rem;
    margin-bottom: 0.5rem;
    text-align: left;
    border-radius: 3px;

    p {
      margin: 0.25rem;
    }
  }

  #imgDisplay {
    overflow: hidden;
    display: block;
    margin: auto;
  }

  i {
    margin: 1.5rem;
  }

  div.indent {
    margin-left: 0.5rem;
  }

  input.form-check-input {
    margin: 1rem auto;
  }

  .smallLink {
    height: fit-content;
    color: $blue;
    font-style: italic;
    margin-top: 0.5rem;
    display: block;
  }

  a {
    text-decoration: underline;
  }

  .active {
    border: $blood 3px dashed;
  }
</style>
