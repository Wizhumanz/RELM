<script>
  import { goto } from "@sapper/app";
  import { storeUser } from "../../store.js";
  import Listings from "./listings/[slug].svelte";
  import axios from "axios";

  //state of user across whole app
  let user = {
    id: "",
    listings: [],
  };

  //only for user login
  let userLogin = {
    email: "",
    password: "",
  };

  function getPublicListings() {
    //auth header
    const hds = {
      // "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Expires: "0",
    };

    //MUST replace all '+' with '%2B'
    // let GETUrl = basicURL.split("+").join("%2B");
    axios
      .get(
        "https://relm-api.myika.co/listings?user=agent%40agent.com&isPublic=true", //get all public listings for this user
        {
          headers: hds,
        }
      )
      .then((res) => {
        user.listings = res.data;
        storeUser.set(JSON.stringify(user));
      })
      .catch((error) => console.log(error));
  }

  function signIn(e) {
    const hds = {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Expires: "0",
    };

    axios
      .post("https://relm-api.myika.co/login", {
        headers: hds,
        body: {
          email: userLogin.email,
          password: userLogin.password,
        },
      })
      .then((res) => {
        console.log(res.data)
      })
      .catch((error) => console.log(error));
  }

  getPublicListings();
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
