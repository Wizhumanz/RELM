<script>
  import { storeUser } from "../../store.js";

  var id;
  storeUser.subscribe((newValue) => {
    console.log("NAV = " + newValue);
    if (newValue) {
      id = JSON.parse(newValue).id;
    }
  });

  //css
  // TODO: not working hamburger menu anim
  // function toggleExpanded() {
  //     var element = document.getElementById("the-nav");
  //     element.classList.toggle("expanded");
  // }
</script>

<nav class="navbar navbar-expand-sm sticky-top navbar-light" id="the-nav">
  <div class="container-fluid">
    <a class="navbar-brand" href="/">RELM</a>
    <button
      class="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarSupportedContent"
      aria-controls="navbarSupportedContent"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <i class="bi bi-arrow-down-left-square-fill" />
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav ms-auto">
        {#if !id}
          <li class="nav-item">
            <a class="nav-link active" href="/">About</a>
          </li>
          <li class="nav-item">
            <a class="nav-link active" href="/">Pricing</a>
          </li>
        {:else}
          <li class="nav-item">
            <a class="nav-link active" href="/listings">All</a>
          </li>
          <li class="nav-item">
            <a class="nav-link active" href="/listings">Pending</a>
          </li>
          <li class="nav-item">
            <a class="nav-link active" href="/add">Add</a>
          </li>
        {/if}
        <li class="nav-item d-sm-none">
          <span>***</span>
        </li>
        <!-- <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
                        data-bs-toggle="dropdown" aria-expanded="false">
                        Dropdown
                    </a>
                    <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                        <li><a class="dropdown-item" href="#">Action</a></li>
                        <li><a class="dropdown-item" href="#">Another action</a></li>
                        <li>
                            <hr class="dropdown-divider">
                        </li>
                        <li><a class="dropdown-item" href="#">Something else here</a></li>
                    </ul>
                </li> -->
        <!-- <li class="nav-item">
                    <a class="nav-link disabled" href="#" tabindex="-1" aria-disabled="true">Disabled</a>
                </li> -->
      </ul>
      <!-- <form class="d-flex">
                <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
                <button class="btn btn-outline-success" type="submit">Search</button>
            </form> -->
    </div>
  </div>
</nav>

<style type="text/scss">
  @import "../../static/styles/_all";

  nav {
    font-family: $title-font;
    background-color: $cream;

    margin-bottom: 1rem;
    padding: 0;

    @media only screen and (max-width: 767px) {
      margin-bottom: 0.5rem;
    }

    transition: 1.5s ease;
    -moz-transition: 1.5s ease;
    -webkit-transition: 1.5s ease;
  }

  .expanded {
    // background-color: #fffdd0;
    background-color: green;
  }

  a.navbar-brand {
    font-size: 1.5rem;
    padding: 0;
    margin: 1rem 2rem;

    @media only screen and (max-width: 767px) {
      margin: 0.75rem 1rem;
    }
  }

  button.navbar-toggler {
    border: none;

    i {
      opacity: 100;
      color: $blood;
    }
  }

  ul.navbar-nav {
    margin-right: 0;
    margin-top: 0;
    font-size: 1.2rem;

    li {
      font-family: $body-font;
      margin: 0;
      padding: 0.25rem 1rem;

      a {
        padding: 0;
      }
    }
  }
</style>
