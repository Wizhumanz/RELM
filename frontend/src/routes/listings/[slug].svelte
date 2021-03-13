<script>
  import { stores } from "@sapper/app";
  import ListingLI from "../../components/ListingLI.svelte";
  import AddListing from "../add.svelte";
  const { page } = stores();
  var route;

  page.subscribe(({ path, params, query }) => {
    route = params.slug;
  });

  export let id;
  export let listings = [];
  let showPublic = true;
  let showCompleted = false;
  let showApartments = true;
  let showLanded = true;
</script>

<div class="container">
  <!-- TEMP -->
  {#if id && id !== ""}
    <AddListing />
  {/if}

  {#if id == "" || !id}
    <h1>Public Listings</h1>
  {:else if route == "all"}
    <h1>All Listings</h1>
  {:else if route == "pending"}
    <h1>Pending Listings</h1>
  {/if}

  <div id="filters-box">
    <a
      data-bs-toggle="collapse"
      href="filter-options"
      role="button"
      aria-expanded="false"
      aria-controls="filter-options"
      class="expander"
    >
      Filter <i class="bi bi-caret-down-fill" />
    </a>
    <div id="filter-options" class="collapse">
      <h4>Listing Types</h4>
      <div class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          value=""
          id="flexCheckDefault"
          bind:checked={showPublic}
        />
        <label class="form-check-label" for="flexCheckDefault"> Public </label>
      </div>
      <div class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          value=""
          id="flexCheckChecked"
          bind:checked={showCompleted}
        />
        <label class="form-check-label" for="flexCheckChecked">
          Completed
        </label>
      </div>
      <h4>Property Types</h4>
      <div class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          value=""
          id="flexCheckDefault"
          bind:checked={showApartments}
        />
        <label class="form-check-label" for="flexCheckDefault">
          Apartments
        </label>
      </div>
      <div class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          value=""
          id="flexCheckChecked"
          bind:checked={showLanded}
        />
        <label class="form-check-label" for="flexCheckChecked"> Landed </label>
      </div>
      <hr />
    </div>
  </div>

  {#if id && id !== ""}
    <div class="row">
      <div class="col-2" />
      <div class="col-7" />
      <div class="col-3">
        <ul id="checkbox-headers">
          <li>Public</li>
          <li>Complete</li>
          <li>Check</li>
        </ul>
      </div>
    </div>
  {/if}

  {#each listings as l}
    {#if showPublic && showCompleted}
      {#if l.isPublic && l.isCompleted}
        <ListingLI {id} listing={l} />
      {/if}
    {:else if showCompleted}
      {#if l.isCompleted}
        <ListingLI {id} listing={l} />
      {/if}
    {:else if showPublic}
      {#if l.isPublic}
        <ListingLI {id} listing={l} />
      {/if}
    {:else}
      <ListingLI {id} listing={l} />
    {/if}
  {/each}

  {#if id && id !== ""}
    <button>Update Listings</button>
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
