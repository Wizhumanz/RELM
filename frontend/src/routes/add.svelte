<script>
  function uploadImgs(e) {
    const files = document.querySelector("[type=file]").files;
    const filesStr = [];

    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      //convert to base64 encoded string
      let fStr = encodeImageFileAsURL(file);
      filesStr.push(fStr);
    }
  }

  function encodeImageFileAsURL(fi) {
    var fileReader = new FileReader();
    fileReader.onload = function (fileLoadedEvent) {
      var srcData = fileLoadedEvent.target.result; // <--- data: base64

      var newImage = document.createElement("img");
      newImage.src = srcData;

      // document.getElementById("imgDisplay").innerHTML = newImage.outerHTML;
      console.log("Converted Base64 version is " + newImage.src);
    };
    fileReader.readAsDataURL(fi);
  }

  function addListing() {
    const hds = {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Expires: "0",
    };

    axios
      .post("https://relm-api.myika.co/listing", {
        headers: hds,
        imgs: JSON.stringify(filesStr),
      })
      .then((res) => {
        //TODO: further user flow for new registered user
        // storeUser.set(JSON.stringify(user));
        // goto("/listings/all");
        console.log(res.status + " -- " + res.data)
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
