<template>
  <div class="app-container">
    <Toast position="top-right" />
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');

* {

  box-sizing: border-box;
}

html {
  margin: 0;
  padding: 0;
  font-size: 14px;
}

body {
  font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: #f8f9fa;
  color: #495057;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.container {
  padding: 2rem;
}

.p-button {
  margin-right: 0.5rem;
  border-radius: 6px;
}

.p-button-success {
  background-color: #22c55e;
  border-color: #22c55e;
}

.p-button-success:hover {
  background-color: #16a34a;
  border-color: #16a34a;
}

.p-button-danger {
  background-color: #ef4444;
  border-color: #ef4444;
}

.p-button-danger:hover {
  background-color: #dc2626;
  border-color: #dc2626;
}

.p-button-info {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.p-button-info:hover {
  background-color: #2563eb;
  border-color: #2563eb;
}

.p-card {
  margin-bottom: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.p-card .p-card-body {
  padding: 1.5rem;
}

.p-datatable .p-datatable-thead > tr > th {
  background-color: #f1f5f9;
  color: #334155;
  font-weight: 600;
}

.p-datatable .p-datatable-tbody > tr:nth-child(even) {
  background-color: #f8fafc;
}

.p-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.p-dialog .p-dialog-header {
  background-color: #f8f9fa;
  color: #334155;
  padding: 1.25rem;
  border-bottom: 1px solid #e2e8f0;
}

.p-dialog .p-dialog-content {
  padding: 1.5rem;
}

.p-dialog .p-dialog-footer {
  padding: 1.25rem;
  border-top: 1px solid #e2e8f0;
  background-color: #f8f9fa;
}

.p-toast .p-toast-message {
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Custom utility classes */
.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.font-bold {
  font-weight: 700;
}

.font-semibold {
  font-weight: 600;
}

.mb-4 {
  margin-bottom: 1rem;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-success {
  color: #22c55e;
}

.text-danger {
  color: #ef4444;
}

.text-info {
  color: #3b82f6;
}

.text-warning {
  color: #f59e0b;
}
</style> 