<script>
  import { onMount } from "svelte";
  import { goto } from "@sapper/app";
  import { storeUser } from "../../store.js";
  import Listings from "./listings/[slug].svelte";
  import axios from "axios";
  import LoadingIndicator from "../components/LoadingIndicator.svelte";

  //For loading sign
  let loading = false;
  let showRegister = "display: none;";
  let showAlert = "display: none;";
  let agencyList = []
  let mainURL = "https://relm-api.myika.co"
  // let mainURL = "http://localhost:8000"

  //state of user across whole app
  let user = {
    email: "",
    id: "",
    password: "",
    listings: [],
    agencyID: ""
  };

  onMount(() => {
    //if user already logged in, go straight to all listings
    user = storeUser;
    if (user.listings && user.listings.length > 0) {
      if (typeof window !== "undefined") {
        goto("/listings/all");
      }
    } else {
      getListings(true, null).then((res) => {
        user.listings = res;
        Array.from(user.listings).reverse();
        // NOTE: only save public listings to store.js to trigger update in other components
        storeUser.set(JSON.stringify(user));
        // res.forEach((r) => {
        //   console.log(
        //     "PUBLIC GET: " + r.KEY + "-" + r.imgs[0].substring(0, 40)
        //   );
        // });
      });
    }
  });

  //only for user login
  let userLogin = {
    email: "",
    password: "",
  };

  //only for user register
  let userRegister = {
    email: "",
    phone: "",
    name: "",
    type: "Owner",
    password: "",
    agencyID: ""
  };

  function saveUser(data) {
    user.listings = data;
    if (user.listings) {
      //user.listings.reverse();
      user.listings.forEach((l) => {
        if (l.KEY) {
          l.isPublic = l.isPublic === "true" ? true : false;
          l.isPending = l.isPending === "true" ? true : false;
          l.isCompleted = l.isCompleted === "true" ? true : false;
        }
      });
      storeUser.set(JSON.stringify(user));
    }
  }

  function getAllAgency() {
    const hds = {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Expires: "0",
      };
      axios
        .get(mainURL + "/agency", {
          headers: hds,
          mode: "cors",
        })
        .then((res) => {
          agencyList = res.data;
        })
        .catch((error) => {
          console.log(error.response);
        });
  }
  getAllAgency()
  function getListings(onlyPublic, startID) {
    return new Promise((resolve, reject) => {
      //auth header
      const hds = onlyPublic
        ? {
            // "Content-Type": "application/json",
          }
        : {
            // "Content-Type": "application/json",
            auth: user.password,
          };
      //MUST replace all '+' with '%2B'
      // let GETUrl = basicURL.split("+").join("%2B");
      //let changedEndpoint = user.id.replaceAll("@","%40")
      let changedEndpoint = "5632499082330112"; //TODO: change to dynamic
      let url = onlyPublic
        ? mainURL + "/listings?agency=5713686849126400&user=6236916944994304&isPublic=true"
        : mainURL + "/listings?agency=" + user.agencyID + "&user=" + user.id;
      url = startID && startID != "" ? url + "&startID=" + startID : url;
      axios
        .get(url, {
          headers: hds,
          mode: "cors",
        })
        .then((res) => {
          if (res.data) {
            resolve(res.data);
          }
        })
        .catch((error) => console.log(error));
    });
  }

  function signIn(e) {
    loading = true;
    const hds = {};
    axios
      .post(mainURL + "/login", {
        headers: hds,
        email: userLogin.email,
        password: userLogin.password,
        mode: "cors",
      })
      .then((res) => {
        user.email = userLogin.email;
        user.id = res.data.message;
        user.password = userLogin.password;
        user.agencyID = res.data.body
        getListings(false, null).then((fetchedListings) => {
          //save GET to local state + storage
          saveUser(fetchedListings);
          if (fetchedListings != null) {
            //lazy load rest of images in background
            let imgFetchKey = "";

            let fourthListings = fetchedListings.filter((l,i) => {
              if (i%4 == 0 && i != 0) {
                return l
              }
            })

            Array.from(fourthListings).forEach((l) => {
              getListings(false, l.KEY).then((all) => {
                all.forEach((a) => {
                  if (a.imgs[0].length > 10) {
                    console.log(a.imgs)
                    user.listings.find((l) => l.KEY === a.KEY).imgs = a.imgs
                  }
                })
                storeUser.set(JSON.stringify(user));

                // saveUser(all);
              });
            });
            // document.location.reload();
          }
          loading = false;
          goto("/listings/all");
        });
      })
      .catch((error) => {
        console.log(error);
        showAlert = "display: block;";
        loading = false;
      });
  }

  function register(e) {
    if (userRegister.agencyID === "None" || userRegister.agencyID === "") {
      showRegister = "display: block;";
      setTimeout(() => {showRegister = "display: none"}, 7000)
    } else {
      const hds = {};
      axios
        .post(mainURL + "/user", {
          headers: hds,
          name: userRegister.name,
          email: userRegister.email,
          type: userRegister.type,
          password: userRegister.password,
          phone: userRegister.phone,
          agencyID: userRegister.agencyID,
          mode: "cors",
        })
        .then((res) => {
          user.id = userRegister.email;
          user.password = userRegister.password;
          storeUser.set(JSON.stringify(user));
          console.log(res.status + " -- " + res.data);
          // goto("/");
          document.location.reload();
        })
        .catch((error) => console.log(error));
    }
  }

</script>

{#if loading}
  <LoadingIndicator />
{/if}

<main>
  <div class="container">
    <div class="row">
      <div class="col-sm col-md-7" id="info-col">
        <h1 class="brand section-head">R E L M</h1>
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
            <div style={showRegister}>
              <p style="color: RED;">All fields are required!</p>
            </div>
            <form class="form" on:submit|preventDefault={register}>
              <div class="mb-3">
                <label for="accountType" class="form-label"> Type</label>
                <select id="accountType" bind:value={userRegister.type}>
                  <option value="Agent">Agent</option>
                  <option value="Owner">Owner</option>
                  <!-- <option value="Tenant">Tenant</option> -->
                </select>
              </div>
              <div class="mb-3">
                <label for="agencyID" class="form-label">Agency</label>
                <select id="agencyID" bind:value={userRegister.agencyID}>
                  <option value="None">Choose an agency</option>
                  {#if agencyList}
                    {#each agencyList as a}
                      <option value={a.KEY}>{a.name}</option>
                    {/each}
                  {/if}
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
                <ul id="phone">
                  <li>+60-</li>
                  <li>
                    <input
                      type="tel"
                      class="form-control"
                      id="phone"
                      bind:value={userRegister.phone}
                    />
                  </li>
                </ul>
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

  .brand {
    font-family: $body-font;
  }

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

  #phone {
    text-align: left;
    li {
      display: inline-block;
    }
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
