<script>
    import {} from "node:os";
    import ListingLI from "./ListingLI.svelte";

    export let listing = {};
    // name: "Taman Jesselton",
    // 		address: "49, Taman Jesselton, 10450 Georgetown",
    // 		propertyType: "Landed",
    // 		listingType: "Rent",
    // 		price: "6000",
    // 		isPublic: true,
    // 		isCompleted: false,
</script>

<div class="container">
    <div class="row">
        <div class="col-2 d-flex justify-content-center">
            <h1><i class="bi bi-house-door" /></h1>
        </div>
        <div class="col-7">
            <h4>{listing.name}</h4>
            <p>{listing.address}</p>
            <p>Type: {listing.listingType}</p>
            <p>
                Price: RM {listing.price
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </p>
        </div>
        <div class="col-3">
            <div class="form-check form-check-inline">
                <input
                    class="form-check-input"
                    type="checkbox"
                    id="inlineCheckbox1"
                    value="option1"
                    bind:checked={listing.isPublic}
                />
            </div>
            <div class="form-check form-check-inline">
                <input
                    class="form-check-input"
                    type="checkbox"
                    id="inlineCheckbox2"
                    value="option2"
                    bind:checked={listing.isCompleted}
                />
            </div>
            <div class="form-check form-check-inline">
                <input
                    class="form-check-input"
                    type="checkbox"
                    id="inlineCheckbox3"
                    value="option3"
                />
            </div>
        </div>
    </div>
    <hr />
</div>

<style type="text/scss">
    @import "./styles/_all";
    div.container {
        font-family: $body-font;
        margin: 1.5rem auto;
        text-align: left;
        border-radius: 3px;

        p {
            margin: 0;
        }
    }

    input.form-check-input {
        margin: 1rem 0.75rem;
    }
</style>
