<script>
  import { stores, goto } from "@sapper/app";
  import ListingLI from "../../components/ListingLI.svelte";
  import { storeUser, resetState, currentPage } from "../../../store.js";
  import LoadingIndicator from "../../components/LoadingIndicator.svelte";
  const { page } = stores();
  import axios from "axios";

  var route;
  var checkBoxArr = [];
  page.subscribe(({ path, params, query }) => {
    route = params.slug;
    currentPage.set(route);
  });

  let user = {};
  let searchInput = "";
  storeUser.subscribe((newValue) => {
    if (newValue) {
      user = JSON.parse(newValue);
    }
  });
  
  let loading = false;
  let showPublic = false;
  let showCompleted = false;
  let showPending = false;
  let showApartments = false;
  let showLanded = false;
  let minPrice;
  let maxPrice;
  $: console.log(user.listings)

  function handleUpdateBtnClick() {
    //user.IsPublic = user.isPublic.toString()
    //user.IsCompleted = user.isCompleted.toString()
    //user.IsPending = user.isPending.toString()
    resetState.set(true);
    loading = true;
    const hds = {
      auth: "agent",
    };

    let checkBoxSet = new Set(checkBoxArr);
    checkBoxArr = checkBoxSet;
    checkBoxSet.forEach((n) => {
      let found = user.listings.find((e) => e.name === n);
      if (found && found != "" && found != null) {
        //update listing in DB
        let listingSubstitute = { ...found };
        console.log(listingSubstitute)

        // listingSubstitute.isPublic = listingSubstitute.isPublic === "true" ? true : false;
        // listingSubstitute.isPending = listingSubstitute.isPending === "true" ? true : false;
        // listingSubstitute.isCompleted = listingSubstitute.isCompleted === "true" ? true : false;
        console.log(found)
        console.log(listingSubstitute)

        user.listings = user.listings.map(e => {
          if (e.AggregateID == listingSubstitute.AggregateID) {
            return found
          } else {
            return e
          }
        })

        listingSubstitute.isPublic = found.isPublic.toString();
        listingSubstitute.isPending = found.isPending.toString();
        listingSubstitute.isCompleted = found.isCompleted.toString();

        //trying hacky way
        setTimeout(function () {
          axios
            .put(
              "http://localhost:8000/listing/" +
                found.AggregateID +
                "?user=" + user.id,
              JSON.stringify(listingSubstitute),
              {
                headers: hds,
                mode: "cors",
              }
            )
            .then((res) => {
              loading = false;
              // console.log(res.data.body)
              // user.listings = user.listings.map(e => {
              //   if (e.AggregateID == res.data.body.AggregateID) {
              //     res.data.body
              //   }
              // })
              console.log(res.data)
              storeUser.set(JSON.stringify(user));
              console.log(res.status + " -- " + JSON.stringify(res.data));
            })
            .catch((error) => console.log(error.response));
        }, 5000);
      }
    });
  }

  $: if (route === "all") {
    showPublic = false;
    showPending = false;
  } else if (route === "pending") {
    showPublic = false;
    showCompleted = false;
  }

  function uncheckLandedHandler() {
    showLanded = false;
  }
  function uncheckApartmentHandler() {
    showApartments = false;
  }
</script>

<!--Loading Sign-->
{#if loading}
  <LoadingIndicator />
{/if}

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

    <div class="row">
      <div class="col-sm-12 col-md-7">
        {#if route !== undefined}
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
              <label class="form-check-label" for="flexCheckPublic">
                Public
              </label>
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
          </div>
        {/if}
        <div id="filter-options">
          <h4>Property Types</h4>
          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              value=""
              id="flexCheckApartments"
              bind:checked={showApartments}
              on:click={uncheckLandedHandler}
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
              on:click={uncheckApartmentHandler}
            />
            <label class="form-check-label" for="flexCheckLanded">
              Landed
            </label>
          </div>
        </div>
      </div>
      <div class="col-sm-12 col-md-5">
        <form class="d-flex">
          <h4 class="block">Area/ Address Search</h4>
          <input
            class="filterInput block"
            type="search"
            placeholder="e.g. Pulau Tikus"
            aria-label="Search"
            bind:value={searchInput}
          />
        </form>
        <h4>Price</h4>
        <ul id="priceFilterInputs">
          <li>
            <input
              type="number"
              class="filterInput"
              id="ownerName"
              placeholder="1000"
              bind:value={minPrice}
            />
          </li>
          <li><p>-</p></li>
          <li>
            <input
              type="number"
              class="filterInput"
              id="ownerName"
              placeholder="5000"
              bind:value={maxPrice}
            />
          </li>
        </ul>
      </div>
    </div>
    <hr />
  </div>

  {#if user.listings && user.listings.length > 0 && user.listings[0].name !== undefined}
    {#each user.listings as l}
      {#if (l.price <= maxPrice && l.price >= minPrice) || (minPrice == null && maxPrice == null)}
        {#if l && l.area && l.area
          .toLowerCase()
          .includes(
            searchInput.toLowerCase()
          ) || (l.address && l.address
            .toLowerCase()
            .includes(searchInput.toLowerCase())) || searchInput == ""}
          {#if (showPublic && l.isPublic && showCompleted && l.isCompleted) || (showPending && l.isPending && showPublic && l.isPublic)}
            {#if showApartments && l.propertyType == "1"}
              <ListingLI
                id={user.id}
                listing={l}
                on:checkedChange={(e) => {
                  checkBoxArr = e.detail.arr;
                }}
              />
            {:else if showLanded && l.propertyType == "0"}
              <ListingLI
                id={user.id}
                listing={l}
                on:checkedChange={(e) => {
                  checkBoxArr = e.detail.arr;
                }}
              />
            {/if}

            {#if !showApartments && !showLanded}
              <ListingLI
                id={user.id}
                listing={l}
                on:checkedChange={(e) => {
                  checkBoxArr = e.detail.arr;
                }}
              />
            {/if}
          {:else if !(showPublic && showCompleted) && !(showPublic && showPending) && ((showPending && l.isPending) || (showPublic && l.isPublic) || (showCompleted && l.isCompleted) || (!showPublic && !showCompleted && !showPending))}
            {#if showApartments && l.propertyType == "1"}
              <ListingLI
                id={user.id}
                listing={l}
                on:checkedChange={(e) => {
                  checkBoxArr = e.detail.arr;
                }}
              />
            {:else if showLanded && l.propertyType == "0"}
              <ListingLI
                id={user.id}
                listing={l}
                on:checkedChange={(e) => {
                  checkBoxArr = e.detail.arr;
                }}
              />
            {/if}

            {#if !showApartments && !showLanded}
              <ListingLI
                id={user.id}
                listing={l}
                on:checkedChange={(e) => {
                  checkBoxArr = e.detail.arr;
                }}
              />
            {/if}
          {/if}
        {/if}
      {/if}
    {/each}
  {:else}
    <p>No Listings Available.</p>
  {/if}

  {#if user.id && user.id !== "" && checkBoxArr.length > 0}
    <button id="updateBtn" on:click={handleUpdateBtnClick}
      >Update Listings</button
    >
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

  .block {
    display: block;
    width: 80%;
  }

  .filterInput {
    border: $blood 1px dashed;
    border-radius: 5px;
  }

  #priceFilterInputs {
    li {
      display: inline-block;
    }
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

  #updateBtn {
    font-size: x-large;
    margin-top: 1rem;
  }

  #updateBtn:disabled {
    opacity: 0.5;
  }
</style>
