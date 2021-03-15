<script>
  import { goto } from "@sapper/app";
  import { storeUser } from "../../store.js";
  import Listings from "./listings/[slug].svelte";
  import axios from "axios";
  import { time_ranges_to_array } from "svelte/internal";

  var allListings = [];

  //set when user logs in
  let user = {
    // id: "AGENT", //TEMP
    // listings: allListings, //TEMP
    id: "", //TEMP
    listings: [] //TEMP
  };
  let userLogin = {
    email: "",
    password: "",
  };

  function signIn(e) {
    if (
      userLogin.email === "agent@agent.com" &&
      userLogin.password === "agent"
    ) {
      //getListings()
      user.id = "AGENT";
      user.listings = allListings;
      console.log(user)
      storeUser.set(JSON.stringify(user));
      goto("/listings/all");
    } else if (
      userLogin.email === "owner@owner.com" &&
      userLogin.password === "owner"
    ) {
      user.id = "OWNER";
    }
  }

  //function getListings() {
    //auth header
    const hds = {
      // "Content-Type": "application/json",
      auth: "password",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Expires: "0",
    };
    //TODO: response cached, won't fetch fresh data from api
    //timestamp add onto request to avoid caching

    /*
  let t = new Date().getTime();
  let basicURL =
    "https://relm-api.myika.co/listings?user=2021-03-14_20:57:36_+0800" +
    "&timestamp=" +
    t;
  //MUST replace all '+' with '%2B'
  let GETUrl = basicURL.split("+").join("%2B");
  console.log(GETUrl);
  */

    axios
      .get(
        "https://relm-api.myika.co/listings?user=2021-03-14_20:57:36_%2B0800",
        {
          headers: hds,
        }
      )
      .then((res) => (allListings = res.data))
      .catch((error) => console.log(error))
      console.log(allListings)
  //}


  let publicUser = {
    id: "not logged in",
    listings: []
  }
  getPublicListings()

  function getPublicListings() {
    //auth header
    const hds = {
      // "Content-Type": "application/json",
      auth: "password",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Expires: "0",
    };

    axios
      .get(
        "https://relm-api.myika.co/listings?user=2021-03-14_20:57:36_%2B0800&isPublic=true",
        {
          headers: hds,
        }
      )
      .then((res) => (publicUser.listings = res.data))
      .catch((error) => console.log(error));
  }

  console.log(publicUser)

  //TEMP mock login
  // user.id = "AGENT";
  // user.listings = allListings;
  // userId.set(user.id);
</script>

<main>
  <div class="container">
    <div class="row">
      <div class="col-sm col-md-7" id="info-col">
        <h1 class="brand section-head">RELM</h1>
        <p>
          <strong>R</strong>eal <strong>E</strong>state
          <strong>L</strong>isting <strong>M</strong>anager.
        </p>
        <p>
          Designed by <a href="https://myika.co">Myika Technologies</a>.
        </p>
      </div>
      <div class="col-sm col-md-5" id="login-col">
        <h4 class="section-head">Sign In</h4>
        <form class="form" on:submit|preventDefault={signIn}>
          <div class="mb-3">
            <label for="email" class="form-label"> Email</label>
            <input
              type="email"
              class="form-control"
              id="email"
              placeholder="name@agency.com"
              bind:value={userLogin.email}
            />
          </div>
          <div class="mb-3">
            <label for="password" class="form-label"> Password</label>
            <input
              type="text"
              class="form-control"
              id="password"
              placeholder="password"
              bind:value={userLogin.password}
            />
          </div>
          <button type="submit">Sign In</button>
        </form>
      </div>
    </div>
  </div>
  <hr />

  <Listings {...publicUser} />
</main>

<style type="text/scss">
  @import "../../static/styles/_all";

  #info-col {
    text-align: center;
    padding: 3rem;
    font-size: larger;
  }
  strong {
    color: $blue;
  }
  #login-col {
    text-align: left;
    padding: 4rem auto;
  }

  input {
    font-family: $body-font;
    background-color: $ivory;
    border: $blood 1px dashed;
  }
  input:focus-within {
    background-color: $blood;
    color: $ivory;
  }

  hr {
    margin: 3rem auto;
  }
</style>
