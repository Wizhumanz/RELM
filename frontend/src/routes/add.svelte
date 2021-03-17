<script>
  import axios from "axios";

  let files;
  let filesStr = [];

  function uploadImgs(e) {
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
      filesStr.push(newImage.src)
    };
    fileReader.readAsDataURL(fi);
  }

  function addListing() {
    console.log("adding listing");

    const hds = {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Expires: "0",
      auth: "agent",
    };

    let data = {
      name: "TEST IMG",
      imgs: filesStr,
      user: "agent@agent.com",
      owner: "owner@owner.com",
      address: "Jalan Besar 7",
      postcode: "10130",
      area: "Teluk Bahang",
      price: "8000",
      propertyType: "1",
      listingType: "1",
      availableDate: "",
      isPublic: "true",
      isCompleted: "false",
      isPending: "false",
    };

    axios
      .post("http://localhost:8000/listing", data, {
        headers: hds
      })
      .then((res) => {
        console.log(res.status + " -- " + JSON.stringify(res.data));
      })
      .catch((error) => console.log(error));
  }
</script>

<div class="container">
  <h1>Add Listing</h1>

  <div class="row">
    <div class="col-sm col-md-3">
      <button id="excel-upload">Upload Excel</button>
    </div>
    <div class="col-sm col-md-9">
      <!-- file upload -->
      <!-- <div id="imgDisplay"></div> -->
      <form
        method="post"
        enctype="multipart/form-data"
        on:submit|preventDefault={uploadImgs}
      >
        <input type="file" name="files[]" multiple />
        <input type="submit" value="Upload File" name="submit" />
      </form>

      <div id="manual-add-box">
        <h4 class="section-head">Manual Add</h4>
        <form class="form" on:submit|preventDefault={addListing}>
          <div class="mb-3">
            <label for="name" class="form-label">Name</label>
            <input
              type="text"
              class="form-control"
              id="name"
              placeholder="Premium Condo"
            />
          </div>
          <div class="mb-3">
            <label for="address" class="form-label">Address</label>
            <input
              type="text"
              class="form-control"
              id="address"
              placeholder="38-A Skyhome, Jalan Tanjung Tokong"
            />
          </div>
          <div class="mb-3">
            <label for="listingType" class="form-label">Address</label>
            <select id="listingType" class="form-select">
              <option value="Rent">Rent</option>
              <option value="Buy">Buy</option>
            </select>
          </div>
          <div class="mb-3">
            <label for="price" class="form-label">Price</label>
            <input
              type="number"
              class="form-control"
              id="price"
              placeholder="RM 1,000"
            />
          </div>
          <button type="submit">Add</button>
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

  button {
    font-size: x-large;
  }

  #excel-upload {
    margin: 5rem auto;
  }
</style>
