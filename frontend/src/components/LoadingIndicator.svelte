<script>
  import { onMount } from "svelte";
  let text = "";

  async function loop() {
    if (text.length === 8) text = "";
    text += " .";
    await new Promise((resolve) => setTimeout(resolve, 250));
    loop();
  }

  onMount(() => {
    loop();
  });
</script>

<div class="LoadingIndicator">
  <h1 class="loader">{text}</h1>
</div>

<style type="text/scss">
  @import "../../static/styles/_all";

  .LoadingIndicator {
    display: flex;
    background: rgba(0, 0, 0, 0.4);
    justify-content: center;
    align-items: center;
    text-align: center;
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    z-index: 20;
    font-size: 60px;
    height: 100%;
    overflow: hidden;
  }

  .loader {
    color: $cream;
    background-color: rgba(0, 0, 0, 0);
  }
</style>
