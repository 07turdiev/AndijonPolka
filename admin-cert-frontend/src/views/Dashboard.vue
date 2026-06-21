<template>
  <div class="dashboard-container">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo-container">
          <!-- <img src="http://study.madaniyhayot.uz/assets/logo-67a6f6ec.png" alt="Logo" class="sidebar-logo" /> -->
          <h2>{{ $t('app_name') }}</h2>
        </div>
        <Button icon="pi pi-bars" class="p-button-rounded p-button-text sidebar-toggle" @click="toggleSidebar" />
      </div>
      <div class="sidebar-user">
        <Avatar icon="pi pi-user" class="user-avatar" size="large" />
        <div class="user-info">
          <span class="user-name">Admin</span>
          <small class="user-role">Administrator</small>
        </div>
      </div>
      <nav class="sidebar-nav">
        <ul>
          <li>
            <router-link to="/applications" class="nav-link">
              <i class="pi pi-file-o"></i>
              <span>{{ $t('applications') }}</span>
              <Badge :value="getApplicationsCount" severity="info" class="nav-badge" v-if="getApplicationsCount > 0"></Badge>
            </router-link>
          </li>
          <li>
            <router-link to="/certified-users" class="nav-link">
              <i class="pi pi-users"></i>
              <span>{{ $t('certified_users') }}</span>
            </router-link>
          </li>
          <li>
            <router-link to="/organizations" class="nav-link">
              <i class="pi pi-building"></i>
              <span>{{ $t('organizations') }}</span>
            </router-link>
          </li>
          <li>
            <router-link to="/test-topics" class="nav-link">
              <i class="pi pi-book"></i>
              <span>Test Topics</span>
            </router-link>
          </li>
          <li>
            <router-link to="/test-questions" class="nav-link">
              <i class="pi pi-question-circle"></i>
              <span>Test Questions</span>
            </router-link>
          </li>
          <li>
            <router-link to="/quarters" class="nav-link">
              <i class="pi pi-calendar"></i>
              <span>{{ $t('quarters') }}</span>
            </router-link>
          </li>
          <li>
            <a href="#" @click.prevent="logout" class="nav-link">
              <i class="pi pi-sign-out"></i>
              <span>{{ $t('logout') }}</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>
    <main class="content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <div class="content-header">
        <h1>{{ $t(pageTitle) }}</h1>
      </div>
      <div class="content-body">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'Dashboard',
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const sidebarCollapsed = ref(false)
    
    // Compute page title based on current route
    const pageTitle = computed(() => {
      const routeName = route.name
      if (routeName === 'Applications') return 'applications'
      if (routeName === 'CertifiedUsers') return 'certified_users'
      if (routeName === 'Organizations') return 'organizations'
      if (routeName === 'TestTopics') return 'Test Topics'
      if (routeName === 'TestQuestions') return 'Test Questions'
      if (routeName === 'Quarters') return 'quarters'
      return 'dashboard'
    })
    
    // Get applications count for badge
    const getApplicationsCount = computed(() => {
      return store.state.applicationStats.new || 0
    })
    
    // Toggle sidebar collapse on mobile
    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }
    
    // Logout handler
    const logout = () => {
      store.dispatch('logout')
      router.push('/login')
    }
    
    return {
      pageTitle,
      logout,
      sidebarCollapsed,
      toggleSidebar,
      getApplicationsCount
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 280px;
  background-color: #1e293b;
  color: #f1f5f9;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 1000;
  transition: all 0.3s ease;
}

.sidebar-header {
  padding: 1.25rem;
  border-bottom: 1px solid #334155;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-container {
  display: flex;
  align-items: center;
}

.sidebar-logo {
  width: 36px;
  height: auto;
  margin-right: 0.75rem;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-toggle {
  color: #f1f5f9;
  display: none;
}

.sidebar-user {
  padding: 1.25rem;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #334155;
}

.user-avatar {
  background-color: #3b82f6;
  color: #ffffff;
}

.user-info {
  margin-left: 0.75rem;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.user-role {
  color: #94a3b8;
  font-size: 0.75rem;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.875rem 1.5rem;
  color: #cbd5e1;
  text-decoration: none;
  transition: all 0.2s;
  position: relative;
}

.nav-link:hover {
  background-color: #334155;
  color: #f1f5f9;
}

.nav-link i {
  margin-right: 0.75rem;
  font-size: 1.1rem;
  width: 1.5rem;
  text-align: center;
}

.router-link-active {
  background-color: #3b82f6;
  color: #ffffff;
}

.router-link-active:hover {
  background-color: #2563eb;
  color: #ffffff;
}

.nav-badge {
  position: absolute;
  right: 1.5rem;
}

.content {
  flex: 1;
  margin-left: 280px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.content-header {
  padding: 1.5rem 2rem;
  background-color: #ffffff;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
}

.content-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
}

.content-body {
  flex: 1;
  padding: 2rem;
  background-color: #f1f5f9;
}

/* Responsive styles */
@media (max-width: 991.98px) {
  .sidebar {
    transform: translateX(0);
    width: 240px;
  }
  
  .sidebar.collapsed {
    transform: translateX(-100%);
  }
  
  .content {
    margin-left: 240px;
  }
  
  .content.sidebar-collapsed {
    margin-left: 0;
  }
  
  .sidebar-toggle {
    display: block;
  }
}

@media (max-width: 767.98px) {
  .sidebar {
    width: 100%;
    transform: translateX(-100%);
  }
  
  .sidebar.collapsed {
    transform: translateX(0);
  }
  
  .content {
    margin-left: 0;
  }
  
  .content-header {
    padding: 1rem;
  }
  
  .content-body {
    padding: 1rem;
  }
}
</style> 