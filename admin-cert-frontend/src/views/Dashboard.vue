<template>
  <div class="dashboard-container">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>Andijon Polkasi</h2>
      </div>
      <div class="sidebar-user">
        <div class="avatar"><i class="pi pi-user"></i></div>
        <div class="user-info">
          <span class="user-name">Admin</span>
          <small class="user-role">Administrator</small>
        </div>
      </div>
      <nav class="sidebar-nav">
        <ul>
          <li>
            <router-link to="/participants" class="nav-link">
              <i class="pi pi-users"></i><span>Ishtirokchilar</span>
            </router-link>
          </li>
          <li>
            <a href="#" @click.prevent="askLogout" class="nav-link">
              <i class="pi pi-sign-out"></i><span>Chiqish</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>
    <main class="content">
      <div class="content-body">
        <router-view />
      </div>
    </main>

    <Dialog v-model:visible="logoutDialog" header="Chiqish" :modal="true" :style="{ width: '400px' }" :draggable="false">
      <div class="logout-body">
        <i class="pi pi-sign-out logout-icon"></i>
        <p>Haqiqatdan ham tizimdan chiqmoqchimisiz?</p>
      </div>
      <template #footer>
        <Button label="Yo‘q" class="p-button-text" @click="logoutDialog = false" />
        <Button label="Ha, chiqish" icon="pi pi-sign-out" class="p-button-danger" @click="confirmLogout" />
      </template>
    </Dialog>

    <Toast />
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'Dashboard',
  setup() {
    const store = useStore()
    const router = useRouter()
    const logoutDialog = ref(false)
    const askLogout = () => { logoutDialog.value = true }
    const confirmLogout = () => {
      logoutDialog.value = false
      store.dispatch('logout')
      router.push('/login')
    }
    return { logoutDialog, askLogout, confirmLogout }
  }
}
</script>

<style scoped>
.dashboard-container { display: flex; min-height: 100vh; }
.sidebar { width: 260px; background: #1e293b; color: #f1f5f9; position: fixed; top: 0; left: 0; bottom: 0; display: flex; flex-direction: column; }
.sidebar-header { padding: 1.25rem; border-bottom: 1px solid #334155; }
.sidebar-header h2 { margin: 0; font-size: 1.1rem; font-weight: 600; }
.sidebar-user { padding: 1.25rem; display: flex; align-items: center; border-bottom: 1px solid #334155; }
.avatar { width: 42px; height: 42px; border-radius: 50%; background: #3b82f6; display: flex; align-items: center; justify-content: center; color: #fff; }
.user-info { margin-left: .75rem; display: flex; flex-direction: column; }
.user-name { font-weight: 600; }
.user-role { color: #94a3b8; font-size: .75rem; }
.sidebar-nav { flex: 1; padding: 1rem 0; }
.sidebar-nav ul { list-style: none; padding: 0; margin: 0; }
.nav-link { display: flex; align-items: center; padding: .875rem 1.5rem; color: #cbd5e1; text-decoration: none; transition: all .2s; }
.nav-link:hover { background: #334155; color: #fff; }
.nav-link i { margin-right: .75rem; font-size: 1.1rem; }
.router-link-active { background: #3b82f6; color: #fff; }
.content { flex: 1; margin-left: 260px; background: #f1f5f9; }
.content-body { padding: 2rem; }
@media (max-width: 767px) {
  .sidebar { width: 100%; position: static; flex-direction: row; }
  .sidebar-user { display: none; }
  .content { margin-left: 0; }
  .content-body { padding: 1rem; }
}
.logout-body { display: flex; align-items: center; gap: 14px; padding: 6px 0; }
.logout-icon { font-size: 26px; color: #ef4444; }
.logout-body p { margin: 0; font-size: 15px; color: #334155; }
</style>
