<script>
  import { onMount } from "svelte";
  import axios from "axios";
  import { storeUser } from "../../store.js";
  import LoadingIndicator from "../components/LoadingIndicator.svelte";

  let user = {};
  storeUser.subscribe((newValue) => {
    if (newValue) {
      user = JSON.parse(newValue);
    }
  });

  let loading = false;
  let addedAlert = "display: none;";
  let fileSizeAlert = "display: none;";
  let ownerExistsAlert = "display: none;";
  let emailPhoneAlert = "display: none;";
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
  let price = 1000;
  let propertyType;
  let listingType;
  let dateString;
  let isPublic = false;
  let isCompleted = false;
  let isPending = false;
  let ownerInfo = {
    name: "",
    phone: "",
  };

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

      if (Math.round(file.size / 1024) > 200) {
        fileSizeAlert = "display: block;";
        setTimeout(() => {
          fileSizeAlert = "display: none;";
        }, 7000);
        loading = false;
      }

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
    loading = true;

    //converts images to base64 strings
    uploadImgs(),
      setTimeout(function () {
        if (loading) {
          const hds = {
            auth: user.password,
          };
          //Don't change any of these properties
          let data = {
            user: user.id, //get user.id from store.js
            ownerName: ownerInfo.name,
            owner: owner,
            ownerPhone: ownerInfo.phone,
            name: name, //name of listings are immutable
            address: address,
            postcode: postcode,
            area: area,
            price: price.toString(),
            propertyType: propertyType.toString(),
            listingType: listingType.toString(),
            availableDate: dateString.toString(),
            isPublic: isPublic.toString(),
            isCompleted: isCompleted.toString(),
            isPending: isPending.toString(),
            imgs: filesStr,
          };
          axios
            .post("https://relm-api.myika.co/listing", data, {
              headers: hds,
            })
            .then((res) => {
              loading = false;
              addedAlert = "display: block;";

              //save new listing to local state
              let localImgs = [];
              Array.from(filesStr).forEach((imgStr) => {
                if (imgStr != "") {
                  //change img string for display on /listings
                  localImgs.push(imgStr.substring(imgStr.indexOf(",") + 1));
                }
              });

              let newListing = {
                user: user.id, //get user.id from store.js
                owner: owner,
                name: name, //name of listings are immutable
                address: address,
                postcode: postcode,
                area: area,
                price: price.toString(),
                propertyType: propertyType.toString(),
                listingType: listingType.toString(),
                availableDate: dateString.toString(),
                isPublic: isPublic.toString(),
                isCompleted: isCompleted.toString(),
                isPending: isPending.toString(),
                imgs: localImgs,
              };
              user.listings = [...user.listings, newListing];
              storeUser.set(JSON.stringify(user));

              //reset inputs
              (now = new Date()), month, day, year;
              files = document.querySelector("[type=file]");
              files.value = null;
              files = "";
              filesStr = [];
              owner = "";
              name = "";
              address = "";
              postcode = "";
              area = "";
              price = 1000;
              propertyType;
              listingType;
              dateString;
              isPublic = false;
              isCompleted = false;
              isPending = false;
              ownerInfo.name = "";
              ownerInfo.phone = "";

              setTimeout(() => {
                addedAlert = "display: none;";
              }, 7000);
              console.log(JSON.stringify(data));
            })
            .catch((error) => {
              if (error.response.data.body == "Input new owner") {
                ownerExistsAlert = "display: block;";
                setTimeout(() => {
                  ownerExistsAlert = "display: none;";
                }, 7000);
              } else if (
                error.response.data.body ==
                "Email or phone number already in use"
              ) {
                emailPhoneAlert = "display: block;";
                setTimeout(() => {
                  emailPhoneAlert = "display: none;";
                }, 7000);
              }
              console.log(error.response);
              loading = false;
            });
        }
      }, 1000);
  }
</script>

<!--Loading Sign-->
{#if loading}
  <LoadingIndicator />
{/if}

<div class="container">
  <div id="head">
    <h1>Add Listing</h1>
    <p>All fields are required.</p>
  </div>

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
          <input
            id="fileUpload"
            type="file"
            name="files[]"
            multiple
            required="required"
          />
        </form>
        <form class="form" on:submit|preventDefault={addListing}>
          <div class="mb-3">
            <label for="ownerName" class="form-label">Owner Name</label>
            <input
              required="required"
              type="text"
              class="form-control"
              id="ownerName"
              placeholder="Rahul"
              bind:value={ownerInfo.name}
            />
            <div class="mb-3">
              <label for="ownerEmail" class="form-label">Owner Email</label>
              <input
                required="required"
                type="text"
                class="form-control"
                id="ownerEmail"
                placeholder="owner@owner.com"
                bind:value={owner}
              />
              <div class="mb-3">
                <label for="ownerPhone" class="form-label">Owner Phone</label>
                <input
                  required="required"
                  type="text"
                  class="form-control"
                  id="ownerPhone"
                  placeholder="01247788745"
                  bind:value={ownerInfo.phone}
                />
              </div>
              <div class="mb-3">
                <label for="name" class="form-label">Property Name</label>
                <input
                  required="required"
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
                  required="required"
                  type="text"
                  class="form-control"
                  id="address"
                  placeholder="38-A Skyhome, Jalan Tanjung Tokong"
                  bind:value={address}
                />
              </div>
              <div class="mb-3">
                <label for="area" class="form-label">Area</label>
                <input
                  required="required"
                  type="text"
                  class="form-control"
                  id="area"
                  placeholder="Teluk Bahang"
                  bind:value={area}
                />
              </div>
              <div class="mb-3">
                <label for="postcode" class="form-label">Postcode</label>
                <input
                  required="required"
                  type="text"
                  class="form-control"
                  id="postcode"
                  placeholder="10130"
                  bind:value={postcode}
                />
              </div>
              <div class="mb-3">
                <label for="availableDate" class="form-label"
                  >Available Date</label
                >
                <input
                  required="required"
                  id="availableDate"
                  type="date"
                  bind:value={dateString}
                />
              </div>
              <div class="mb-3">
                <label for="price" class="form-label">Price</label>
                <input
                  required="required"
                  type="number"
                  class="form-control"
                  id="price"
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
                <label for="propertyType" class="form-label"
                  >Property Type</label
                >
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
                <input
                  class="form-check-input addCheckbox"
                  id="publicCheck"
                  type="checkbox"
                  value=""
                  bind:checked={isPublic}
                />
                <label class="form-check-label" for="publicCheck">Public</label>
              </div>
              <div class="form-check form-check-inline">
                <input
                  class="form-check-input addCheckbox"
                  id="completedCheck"
                  type="checkbox"
                  value=""
                  bind:checked={isCompleted}
                />
                <label class="form-check-label" for="completedCheck">
                  Completed
                </label>
              </div>
              <div class="form-check form-check-inline">
                <input
                  class="form-check-input addCheckbox"
                  id="pendingCheck"
                  type="checkbox"
                  value=""
                  bind:checked={isPending}
                />
                <label class="form-check-label" for="pendingCheck"
                  >Pending</label
                >
              </div>
              <div>
                <button type="submit">Add</button>
              </div>
              <div style={addedAlert}>
                <p>Listing added!</p>
              </div>
              <div style={fileSizeAlert}>
                <p>Image size too large. Each image must be under 200KB.</p>
              </div>
              <div style={ownerExistsAlert}>
                <p>Owner already exists. Please enter a new owner.</p>
              </div>
              <div style={emailPhoneAlert}>
                <p>
                  The email or phone number you typed in is already in use.
                  Please enter a new one.
                </p>
              </div>
            </div>
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
    p {
      color: $blood;
    }
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
