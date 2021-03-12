<script>
  import Navbar from "../components/Navbar.svelte";
</script>

<main>
  <Navbar {...user} />

  <slot />
</main>

<style>
</style>
