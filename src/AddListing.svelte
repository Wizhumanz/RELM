<script>
    let selectedMethod;

    let methodOptions = [
        { id: 0, text: `Manual add` },
        { id: 1, text: `Upload Excel` },
    ];
</script>

<div class="container">
    <h1>Add Listing</h1>

    <select
        class="form-select form-select-lg mb-3"
        aria-label=".form-select-lg example"
        bind:value={selectedMethod}
    >
        {#each methodOptions as opt}
            <option value={opt}>
                {opt.text}
            </option>
        {/each}
    </select>

    {#if selectedMethod && selectedMethod.id == 0}
        <div id="manual-add-box">
            <!-- <h4 class="section-head">Sign In</h4> -->
            <form class="form" action="#" on:submit={addManualListing}>
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
    {:else if selectedMethod}
        <h1>Excel Add!</h1>
    {/if}

    <button>Add All</button>
</div>

<style type="text/scss">
    @import "./styles/_all";

    div.container {
        text-align: center;
        padding-bottom: 4rem;
    }

    h1 {
        margin-bottom: 1rem;
    }

    select {
        background-color: $ivory;
        border: $blood 1px dashed;
        font-family: $body-font;
        font-size: large;
    }

    #manual-add-box {
        padding: 2rem;
        text-align: left;
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

    button {
        font-size: x-large;
    }
</style>
