<script>
import { RouterView } from 'vue-router'
import Header from './layouts/Header.vue'
import Footer from './layouts/Footer.vue'
export default {
  components: {
    Header,
    Footer,
  },
}
</script>

<template>
  <div class="app-shell">
    <Header/>
    <main class="app-main">
      <RouterView />
    </main>
    <Footer/>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
/* Offset the fixed 60px header so content isn't hidden underneath,
   and let main grow so the footer sticks to the bottom */
.app-main {
  flex: 1 0 auto;
  padding-top: 60px;
}
</style>
