<script>
  import { goto } from "@sapper/app";
  import { storeUser } from "../../store.js";
  import Listings from "./listings/[slug].svelte";
  let mockListingsAgent = [
    {
      name: "Taman Jesselton",
      address: "49, Taman Jesselton, 10450 Georgetown",
      propertyType: "Landed",
      listingType: "Rent",
      price: "6000",
      isPublic: true,
      isCompleted: false,
      isPending: false,
    },
    {
      name: "The Cove",
      address: "10-55-A, The Cove, 11200 Tanjung Tokong",
      propertyType: "Apartment",
      listingType: "Buy",
      price: "3000000",
      isPublic: true,
      isCompleted: false,
      isPending: false,
    },
    {
      name: "Skyhome Condo",
      address: "1-3-7A Skyhome, Jalan Lembah Permai 4, 11200 Tanjung Tokong",
      propertyType: "Apartment",
      listingType: "Rental",
      price: "4500",
      isPublic: false,
      isCompleted: false,
      isPending: false,
    },
    {
      name: "Mansion Five",
      address: "No. 8 Solok Peirce, 10350 Georgetown",
      propertyType: "Landed",
      listingType: "Buy",
      price: "12000000",
      isPublic: true,
      isCompleted: true,
      isPending: false,
    },
  ];

  //set when user logs in
  let user = {
    // id: "AGENT", //TEMP
    // listings: mockListingsAgent, //TEMP
    id: "", //TEMP
    listings: mockListingsAgent.filter((l) => l.isPublic), //TEMP
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
      user.id = "AGENT";
      user.listings = mockListingsAgent;
      storeUser.set(JSON.stringify(user));
      goto("/listings/all");
    } else if (
      userLogin.email === "owner@owner.com" &&
      userLogin.password === "owner"
    ) {
      user.id = "OWNER";
    }
  }

  //TEMP mock login
  // user.id = "AGENT";
  // user.listings = mockListingsAgent;
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

  <Listings {...user} />
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
