<script>
export default {
  name: 'App'
}
</script>

<template>
  <RouterView />
</template>

<style>
:root {
  --brand: #1d4ed8;
  --brand-dark: #1e3a8a;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: #eef2f9;
  font-family: 'Montserrat', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  color: #1f2937;
}
</style>
