<script>
  import axios from "axios";
  import { onMount } from "svelte";
  import { storeUser } from "../../store.js";

  let user = {};
  storeUser.subscribe((newValue) => {
    if (newValue) {
      user = JSON.parse(newValue);
    }
  });

  let now = new Date(),
    month,
    day,
    year;
  let files;
  let filesStr = [];
  let owner = "";
  let name = "";
  let address = "";
  let postcode = "";
  let area = "";
  let price = 0;
  let rentBuyOption;
  let propertyType;
  let listingType;
  let dateString;
  let isPublic = false;
  let isCompleted = false;
  let isPending = false;

  onMount(() => {
    (month = "" + (now.getMonth() + 1)),
      (day = "" + now.getDate()),
      (year = now.getFullYear());

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    dateString = [year, month, day].join("-");
  });

  function uploadImgs() {
    files = document.querySelector("[type=file]").files;
    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      //convert to base64 encoded string (pushed to filesStr)
      encodeImageFileAsURL(file);
    }
  }

  function encodeImageFileAsURL(fi) {
    var newImage;
    var fileReader = new FileReader();
    fileReader.onload = function (fileLoadedEvent) {
      var srcData = fileLoadedEvent.target.result; // <--- data: base64

      newImage = document.createElement("img");
      newImage.src = srcData;

      // document.getElementById("imgDisplay").innerHTML = newImage.outerHTML;
      // console.log("Base64 img = " + newImage.src);
      filesStr.push(newImage.src);
    };
    fileReader.readAsDataURL(fi);
  }

  function addListing() {
    uploadImgs(); //converts images to base64 strings

    const hds = {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Expires: "0",
      auth: "agent",
    };
    //Don't change any of these properties
    let data = {
      name: name, //name of listings are immutable
      imgs: filesStr,
      user: user.id, //get user.id from store.js
      owner: owner,
      address: address,
      postcode: postcode,
      area: area,
      price: price.toString(),
      rentBuyOption: rentBuyOption.toString(),
      propertyType: propertyType.toString(),
      listingType: listingType.toString(),
      availableDate: dateString.toString(),
      isPublic: isPublic.toString(),
      isCompleted: isCompleted.toString(),
      isPending: isPending.toString(),
    };
    console.log(data);

    axios
      .post("https://relm-api.myika.co/listing", data, {
        headers: hds,
      })
      .then((res) => {
        console.log(res.status + " -- " + JSON.stringify(res.data));
      })
      .catch((error) => console.log(error.response));
  }
</script>

<div class="container">
  <h1 id="head">Add Listing</h1>

  <div class="row">
    <div class="col-sm col-md-3">
      <button id="excel-upload">Upload Excel</button>
    </div>
    <div class="col-sm col-md-9">
      <div id="manual-add-box">
        <!-- file upload -->
        <!-- <div id="imgDisplay"></div> -->
        <form method="post" enctype="multipart/form-data">
          <label for="fileUpload" class="form-label">Upload Images</label>
          <input id="fileUpload" type="file" name="files[]" multiple />
        </form>
        <form class="form" on:submit|preventDefault={addListing}>
          <div class="mb-3">
            <label for="owner" class="form-label">Owner</label>
            <input
              type="text"
              class="form-control"
              id="owner"
              placeholder="owner@owner.com"
              bind:value={owner}
            />
          </div>
          <div class="mb-3">
            <label for="name" class="form-label">Name</label>
            <input
              type="text"
              class="form-control"
              id="name"
              placeholder="Premium Condo"
              bind:value={name}
            />
          </div>
          <div class="mb-3">
            <label for="address" class="form-label">Address</label>
            <input
              type="text"
              class="form-control"
              id="address"
              placeholder="38-A Skyhome, Jalan Tanjung Tokong"
              bind:value={address}
            />
          </div>
          <div class="mb-3">
            <label for="address" class="form-label">Area</label>
            <input
              type="text"
              class="form-control"
              id="address"
              placeholder="Teluk Bahang"
              bind:value={area}
            />
          </div>
          <div class="mb-3">
            <label for="address" class="form-label">Postcode</label>
            <input
              type="text"
              class="form-control"
              id="address"
              placeholder="10130"
              bind:value={postcode}
            />
          </div>
          <div class="mb-3">
            <label for="rentBuy" class="form-label">Rent/Buy</label>
            <select id="rentBuy" class="form-select" bind:value={rentBuyOption}>
              <option value="Rent">Rent</option>
              <option value="Buy">Buy</option>
            </select>
          </div>
          <div class="mb-3">
            <label for="availableDate" class="form-label">Available Date</label>
            <input id="availableDate" type="date" bind:value={dateString} />
          </div>
          <div class="mb-3">
            <label for="price" class="form-label">Price</label>
            <input
              type="number"
              class="form-control"
              id="price"
              placeholder="RM 1,000"
              bind:value={price}
            />
          </div>
          <div class="mb-3">
            <label for="listingType" class="form-label">Listing Type</label>
            <select
              id="listingType"
              class="form-select"
              bind:value={listingType}
            >
              <option value="0">For Rent</option>
              <option value="1">For Sale</option>
            </select>
          </div>
          <div class="mb-3">
            <label for="propertyType" class="form-label">Property Type</label>
            <select
              id="propertyType"
              class="form-select"
              bind:value={propertyType}
            >
              <option value="0">Landed</option>
              <option value="1">Apartment</option>
            </select>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input addCheckbox" id="publicCheck"
              type="checkbox" value="" bind:checked={isPublic}>
            <label class="form-check-label" for="publicCheck">
              Public
            </label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input addCheckbox" id="completedCheck"
              type="checkbox" value="" bind:checked={isCompleted}>
            <label class="form-check-label" for="completedCheck">
              Completed
            </label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input addCheckbox" id="pendingCheck"
              type="checkbox" value="" bind:checked={isPending}>
            <label class="form-check-label" for="pendingCheck">
              Pending
            </label>
          </div>
          <div>
            <button type="submit">Add</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>

<style type="text/scss">
  @import "../../static/styles/_all";

  div.container {
    text-align: center;
    padding-bottom: 4rem;
  }

  #head {
    margin-bottom: 2rem;
  }

  #manual-add-box {
    padding: 0 4rem;
    text-align: left;
    border-left: 1px solid $blue;
  }

  input,
  select {
    font-family: $body-font;
    background-color: $ivory;
    border: $blood 1px dashed;
  }
  input:focus-within {
    background-color: $blood;
    color: $ivory;
  }

  .form-check {
    margin: 0.75rem 0.5rem;

    label {
      // padding-left: 0.5rem;
    }
  }

  button {
    font-size: x-large;
  }

  #excel-upload {
    margin: 5rem auto;
  }
</style>
