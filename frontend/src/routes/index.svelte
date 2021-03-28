<script>
  import { goto } from "@sapper/app";
  import { storeUser } from "../../store.js";
  import Listings from "./listings/[slug].svelte";
  import axios from "axios";
  import LoadingIndicator from "../components/LoadingIndicator.svelte";

  //For loading sign
  let loading = false;

  let showAlert = "display: none;";

  //state of user across whole app
  let user = {
    id: "",
    password: "",
    listings: [],
  };

  //only for user login
  let userLogin = {
    email: "",
    password: "",
  };

  //only for user register
  let userRegister = {
    email: "",
    phone: null,
    name: "",
    type: "Owner",
    password: "",
  };

  function getListings(onlyPublic) {
    loading = true;
    return new Promise((resolve, reject) => {
      //auth header
      const hds = onlyPublic
        ? {
            // "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Expires: "0",
          }
        : {
            // "Content-Type": "application/json",
            auth: user.password,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Expires: "0",
          };

      //MUST replace all '+' with '%2B'
      // let GETUrl = basicURL.split("+").join("%2B");
      let url = onlyPublic
        ? "https://relm-api.myika.co/listings?user=agent%40agent.com&isPublic=true"
        : "https://relm-api.myika.co/listings?user=agent%40agent.com";
      axios
        .get(url, {
          headers: hds,
        })
        .then((res) => {
          user.listings = res.data;
          if (user.listings.length > 0) {
            Array.from(user.listings).forEach((l) => {
              if (l.name) {
                l.isPublic = l.isPublic === "true" ? true : false;
                l.isPending = l.isPending === "true" ? true : false;
                l.isCompleted = l.isCompleted === "true" ? true : false;
              }
            });
            storeUser.set(JSON.stringify(user));
            resolve(user.listings);
          }
          loading = false;
        })
        .catch((error) => console.log(error));
    });
  }

  function signIn(e) {
    loading = true;

    const hds = {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Expires: "0",
    };

    axios
      .post("https://relm-api.myika.co/login", {
        headers: hds,
        email: userLogin.email,
        password: userLogin.password,
      })
      .then((res) => {
        user.id = userLogin.email;
        user.password = userLogin.password;
        //wait for fetch to complete before needed page reload
        getListings(false).then((fetchedListings) => {
          loading = false;
          goto("/listings/all");
          //document.location.reload();
        });
      })
      .catch((error) => {
        console.log(error);
        showAlert = "display: block;";
      });
  }

  function register(e) {
    const hds = {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Expires: "0",
    };

    axios
      .post("https://relm-api.myika.co/user", {
        headers: hds,
        name: userRegister.name,
        email: userRegister.email,
        type: userRegister.type,
        password: userRegister.password,
      })
      .then((res) => {
        //TODO: further user flow for new registered user
        // storeUser.set(JSON.stringify(user));
        // goto("/listings/all");
        console.log(res.status + " -- " + res.data);
      })
      .catch((error) => console.log(error));
  }

  //if user already logged in, go straight to all listings
  user = storeUser;
  if (user.listings && user.listings.length > 0) {
    if (typeof window !== "undefined") {
      goto("/listings/all");
    }
  } else {
    getListings(true);
  }
</script>

{#if loading}
  <LoadingIndicator />
{/if}

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
        <ul class="nav nav-tabs" id="myTab" role="tablist">
          <li class="nav-item" role="presentation">
            <button
              class="nav-link active"
              id="home-tab"
              data-bs-toggle="tab"
              data-bs-target="#home"
              type="button"
              role="tab"
              aria-controls="home"
              aria-selected="true">Sign In</button
            >
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              id="profile-tab"
              data-bs-toggle="tab"
              data-bs-target="#profile"
              type="button"
              role="tab"
              aria-controls="profile"
              aria-selected="false">Register</button
            >
          </li>
        </ul>
        <div class="tab-content" id="myTabContent">
          <div
            class="tab-pane fade show active"
            id="home"
            role="tabpanel"
            aria-labelledby="home-tab"
          >
            <!-- Sign In tab -->
            <div style={showAlert}>
              <p>Incorrect Login Details</p>
            </div>
            <form class="form" on:submit|preventDefault={signIn}>
              <div class="mb-3">
                <label for="emailLogin" class="form-label"> Email</label>
                <input
                  type="email"
                  class="form-control"
                  id="emailLogin"
                  placeholder="name@agency.com"
                  bind:value={userLogin.email}
                />
              </div>
              <div class="mb-3">
                <label for="passwordLogin" class="form-label"> Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="passwordLogin"
                  placeholder="password"
                  bind:value={userLogin.password}
                />
              </div>
              <button type="submit">Sign In</button>
            </form>
          </div>
          <div
            class="tab-pane fade"
            id="profile"
            role="tabpanel"
            aria-labelledby="profile-tab"
          >
            <!-- Register tab -->
            <form class="form" on:submit|preventDefault={register}>
              <div class="mb-3">
                <label for="accountType" class="form-label"> Type</label>
                <select id="accountType" bind:value={userRegister.type}>
                  <option value="Owner">Owner</option>
                  <option value="Agent">Agent</option>
                  <option value="Tenant">Tenant</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">Name</label>
                <input
                  type="text"
                  class="form-control"
                  id="name"
                  placeholder="Ivy Yeoh"
                  bind:value={userRegister.name}
                />
              </div>
              <div class="mb-3">
                <label for="phone" class="form-label">Phone</label>
                <input
                  type="tel"
                  pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                  class="form-control"
                  id="phone"
                  bind:value={userRegister.phone}
                />
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  placeholder="name@agency.com"
                  bind:value={userRegister.email}
                />
              </div>
              <div class="mb-3">
                <label for="password" class="form-label"> Password</label>
                <input
                  type="text"
                  class="form-control"
                  id="password"
                  placeholder="password"
                  bind:value={userRegister.password}
                />
              </div>
              <button type="submit">Register</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
  <hr />

  <Listings />
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

  button.nav-link {
    color: gray;
    font-size: larger;
  }

  button.nav-link.active {
    background-color: $ivory;
    color: $blood;
  }

  form {
    margin-top: 1rem;
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

  select {
    padding: 0.5rem 0.5rem;
  }

  hr {
    margin: 3rem auto;
  }
</style>
