<script>
  import { stores } from "@sapper/app";
  import ListingLI from "../../components/ListingLI.svelte";
  import { storeUser, resetState, currentPage } from "../../../store.js";
  const { page } = stores();
  import axios from "axios";
  var route;
  let checkBoxArr = []
  page.subscribe(({ path, params, query }) => {
    route = params.slug;
    currentPage.set(route);
  });

  let user = {};

  storeUser.subscribe((newValue) => {
    if (newValue) {
      user = JSON.parse(newValue);
    }
  });

  let showPublic = false;
  let showCompleted = false;
  let showPending = false;
  let showApartments = true;
  let showLanded = true;

  function handleClick() {
    //user.IsPublic = user.isPublic.toString()
    //user.IsCompleted = user.isCompleted.toString()
    //user.IsPending = user.isPending.toString()
    resetState.set(true);

    const hds = {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Expires: "0",
      auth: "agent",
    };

    for (let i = 0; i < checkBoxArr.length-1; i++) {
      user.listings.forEach((listing) => {
        if (listing.name === checkBoxArr[i]) {
          let listingSubstitute = {...listing}
          listingSubstitute.name = null
          listingSubstitute.isPublic = listing.isPublic.toString()
          listingSubstitute.isPending = listing.isPending.toString()
          listingSubstitute.isCompleted = listing.isCompleted.toString()

          axios
            .put("https://relm-api.myika.co/listing/" + listing.name.replaceAll(" ", "+") + "?user=agent%40agent.com", 
            JSON.stringify(listingSubstitute), {
              headers: hds,
            })
            .then((res) => {
              console.log(res.status + " -- " + JSON.stringify(res.data));
            })
            .catch((error) => console.log(error.response))
        }
      })
    }
  }
</script>

<div class="container">
  {#if route == "all"}
    <h1>All Listings</h1>
  {:else if route == "pending"}
    <h1>Pending Listings</h1>
  {:else if user.id && user.id !== ""}
    <h1>Public Listings</h1>
  {/if}

  <div id="filters-box">
    <h4>Filter</h4>
    <div id="filter-options">
      <h4>Listing Types</h4>

      <div class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          value=""
          id="flexCheckPublic"
          bind:checked={showPublic}
        />
        <label class="form-check-label" for="flexCheckPublic"> Public </label>
      </div>

      {#if route !== "pending"}
        <div class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            value=""
            id="flexCheckCompleted"
            bind:checked={showCompleted}
          />
          <label class="form-check-label" for="flexCheckCompleted">
            Completed
          </label>
        </div>
      {:else}
        <div class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            value=""
            id="flexCheckPending"
            bind:checked={showPending}
          />
          <label class="form-check-label" for="flexCheckPending">
            Pending
          </label>
        </div>
      {/if}

      <h4>Property Types</h4>
      <div class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          value=""
          id="flexCheckApartments"
          bind:checked={showApartments}
        />
        <label class="form-check-label" for="flexCheckApartments">
          Apartments
        </label>
      </div>
      <div class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          value=""
          id="flexCheckLanded"
          bind:checked={showLanded}
        />
        <label class="form-check-label" for="flexCheckLanded"> Landed </label>
      </div>
      <hr />
    </div>
  </div>

  {#if user.id && user.id !== ""}
    <div class="row">
      <div class="col-2" />
      <div class="col-7" />
      <div class="col-3">
        <ul id="checkbox-headers">
          <li>Public</li>
          {#if route !== "pending"}
            <li>Complete</li>
            <li>Check</li>
          {:else}
            <li>Pending</li>
          {/if}
        </ul>
      </div>
    </div>
  {/if}

  {#if user.listings && user.listings.length > 0}
    {#each user.listings as l}
      {#if (route === "pending" && l.isPending) || (showPending && l.isPending) || (showPublic && l.isPublic) || (showCompleted && l.isCompleted) || (!showPublic && !showCompleted)}
        <!-- {#if (route === "pending" && l.isPending === "true") || true} -->
        <ListingLI id={user.id} listing={l} {checkBoxArr} />
      {/if}
    {/each}
  {:else}
    <p>Error: No listings to show.</p>
  {/if}

  {#if user.id && user.id !== ""}
    <button on:click={handleClick}>Update Listings</button>
  {/if}
</div>

<style type="text/scss">
  @import "../../../static/styles/_all";

  div.container {
    text-align: center;
    padding-bottom: 4rem;
  }

  a.expander {
    font-family: $body-font;
    font-size: x-large;
  }

  a.expander:hover {
    text-decoration: none;
  }

  #filters-box {
    text-align: left;
  }

  #filter-options {
    padding: 0.5rem 1rem 1rem 1rem;
  }

  h4 {
    margin: 0.75rem auto;
  }

  #checkbox-headers {
    font-family: $body-font;
    text-align: left;
    li {
      display: inline;
      margin-right: 1.2rem;
    }
  }

  button {
    font-size: x-large;
  }
</style>
