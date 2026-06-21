<template>
  <div class="certificates-container">
    <Card>
      <template #title>
        <div class="card-title">
          <span>{{ $t('all_certificates') }}</span>
          <div class="search-container">
            <span class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText v-model="search" :placeholder="$t('search')" />
            </span>
          </div>
        </div>
      </template>
      <template #content>
        <div v-if="loading" class="loading-container">
          <ProgressSpinner />
        </div>
        <div v-else-if="filteredCertificates.length === 0" class="no-results">
          <i class="pi pi-search no-results-icon"></i>
          <h3>{{ $t('no_results') }}</h3>
        </div>
        <DataTable v-else :value="filteredCertificates" :paginator="true" :rows="10" 
                  responsiveLayout="scroll" stripedRows class="certificates-table"
                  :rowHover="true" currentPageReportTemplate="{first} - {last} / {totalRecords}"
                  paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown">
          <Column field="certificate_number" :header="$t('certificate_number')" sortable>
            <template #body="slotProps">
              <div class="certificate-number">
                <span class="cert-number-value">{{ slotProps.data.certificate_number }}</span>
              </div>
            </template>
          </Column>
          <Column field="first_name" :header="$t('name')" sortable>
            <template #body="slotProps">
              <div class="user-info">
                <Avatar :image="getAvatarUrl(slotProps.data)" size="small" shape="circle" class="user-avatar" />
                <div class="user-details">
                  <div class="user-name">{{ slotProps.data.first_name }} {{ slotProps.data.sur_name }}</div>
                  <div class="user-pin text-sm">PIN: {{ slotProps.data.pin }}</div>
                </div>
              </div>
            </template>
          </Column>
          <Column field="category" :header="$t('category')" sortable>
            <template #body="slotProps">
              <span class="category-badge">{{ $t(slotProps.data.category) }}</span>
            </template>
          </Column>
          <Column field="given_date" :header="$t('issue_date')" sortable>
            <template #body="slotProps">
              {{ formatDate(slotProps.data.given_date) }}
            </template>
          </Column>
          <Column field="expr_date" :header="$t('valid_until')" sortable>
            <template #body="slotProps">
              <div class="expiry-date">
                <span>{{ formatDate(slotProps.data.expr_date) }}</span>
                <Badge v-if="isExpired(slotProps.data.expr_date)" 
                      :value="$t('certificate_expired')" severity="danger" />
                <Badge v-else :value="$t('certificate_active')" severity="success" />
              </div>
            </template>
          </Column>
          <Column :header="$t('actions')">
            <template #body="slotProps">
              <div class="actions-container">
                <Button icon="pi pi-eye" class="p-button-info p-button-sm"
                       @click="viewCertificate(slotProps.data)">
                  {{ $t('view_certificate') }}
                </Button>
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <Dialog v-model:visible="showCertDialog" :header="$t('certificate_details')" :style="{width: '550px'}" :modal="true" class="certificate-dialog">
      <div v-if="selectedCertificate" class="certificate-modal">
        <div class="certificate-header">
          <img src="https://study.madaniyhayot.uz/static/image/logo.png" alt="Logo" class="certificate-logo" />
          <h2>{{ $t('app_name') }}</h2>
          <div class="certificate-number-badge">
            #{{ selectedCertificate.certificate_number }}
          </div>
        </div>
        
        <div class="certificate-body">
          <div class="certificate-row">
            <div class="certificate-field">
              <span class="label">{{ $t('name') }}:</span>
              <span class="value">{{ selectedCertificate.first_name }} {{ selectedCertificate.sur_name }}</span>
            </div>
          </div>
          
          <div class="certificate-columns">
            <div class="certificate-field">
              <span class="label">{{ $t('pin') }}:</span>
              <span class="value">{{ selectedCertificate.pin }}</span>
            </div>
            <div class="certificate-field">
              <span class="label">{{ $t('category') }}:</span>
              <span class="value">{{ $t(selectedCertificate.category) }}</span>
            </div>
          </div>
          
          <div class="certificate-columns">
            <div class="certificate-field">
              <span class="label">{{ $t('issue_date') }}:</span>
              <span class="value">{{ formatDate(selectedCertificate.given_date) }}</span>
            </div>
            <div class="certificate-field">
              <span class="label">{{ $t('expiry_date') }}:</span>
              <span class="value" :class="{'expired': isExpired(selectedCertificate.expr_date)}">
                {{ formatDate(selectedCertificate.expr_date) }}
                <Badge v-if="isExpired(selectedCertificate.expr_date)" 
                      :value="$t('certificate_expired')" severity="danger" size="small" />
              </span>
            </div>
          </div>
          
          <div class="qr-section">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://verify.madaniyhayot.uz/cert/" 
                 alt="QR Code" class="qr-code" />
            <div class="qr-info">
              {{ $t('scan_to_verify') }}
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <Button :label="$t('close')" icon="pi pi-times" @click="showCertDialog = false" class="p-button-text" />
        <Button :label="$t('download_certificate')" icon="pi pi-download" class="p-button-success" @click="downloadCertificate" />
      </template>
    </Dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, inject } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'primevue/usetoast'

export default {
  name: 'Certificates',
  setup() {
    const store = useStore()
    const toast = useToast()
    const i18n = inject('i18n')
    
    const loading = ref(true)
    const search = ref('')
    const certificates = computed(() => store.state.certificates)
    const showCertDialog = ref(false)
    const selectedCertificate = ref(null)
    
    const filteredCertificates = computed(() => {
      if (!search.value) return certificates.value
      
      const searchTerm = search.value.toLowerCase()
      return certificates.value.filter(cert => 
        cert.certificate_number.toLowerCase().includes(searchTerm) ||
        cert.first_name.toLowerCase().includes(searchTerm) ||
        cert.sur_name.toLowerCase().includes(searchTerm) ||
        cert.pin.toLowerCase().includes(searchTerm)
      )
    })
    
    onMounted(async () => {
      loading.value = true
      await store.dispatch('fetchCertificates')
      loading.value = false
    })
    
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString()
    }
    
    const isExpired = (dateString) => {
      if (!dateString) return false
      const expiryDate = new Date(dateString)
      const today = new Date()
      return today > expiryDate
    }
    
    const getAvatarUrl = (data) => {
      // In a real app, you might get the user's profile picture
      // For this demo we'll use a placeholder
      return `https://ui-avatars.com/api/?name=${data.first_name}+${data.sur_name}&background=random`
    }
    
    const viewCertificate = (certificate) => {
      selectedCertificate.value = certificate
      showCertDialog.value = true
    }
    
    const downloadCertificate = async () => {
      if (!selectedCertificate.value || !selectedCertificate.value.certificate_id) {
        toast.add({
          severity: 'error',
          summary: i18n.t('error'),
          detail: i18n.t('certificate_not_found'),
          life: 3000
        })
        return
      }
      
      try {
        const success = await store.dispatch('downloadCertificate', {
          certificateId: selectedCertificate.value.certificate_id,
          firstName: selectedCertificate.value.first_name,
          lastName: selectedCertificate.value.sur_name
        })
        
        if (success) {
          toast.add({
            severity: 'success',
            summary: i18n.t('success'),
            detail: i18n.t('certificate_download_started'),
            life: 3000
          })
          
          // Close the dialog
          showCertDialog.value = false
        } else {
          toast.add({
            severity: 'error',
            summary: i18n.t('error'),
            detail: i18n.t('download_failed'),
            life: 3000
          })
        }
      } catch (error) {
        console.error('Download error:', error)
        toast.add({
          severity: 'error',
          summary: i18n.t('error'),
          detail: i18n.t('download_failed'),
          life: 3000
        })
      }
    }
    
    return {
      loading,
      certificates,
      search,
      filteredCertificates,
      showCertDialog,
      selectedCertificate,
      formatDate,
      isExpired,
      getAvatarUrl,
      viewCertificate,
      downloadCertificate
    }
  }
}
</script>

<style scoped>
.certificates-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.search-container {
  flex: 1;
  max-width: 300px;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: #64748b;
}

.no-results-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #94a3b8;
}

.certificate-number {
  font-weight: 600;
  color: #0f172a;
}

.cert-number-value {
  font-family: monospace;
  background-color: #f1f5f9;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  flex-shrink: 0;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: #0f172a;
}

.user-pin {
  font-size: 0.75rem;
  color: #64748b;
}

.category-badge {
  background-color: #f1f5f9;
  color: #475569;
  padding: 0.35rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 500;
}

.expiry-date {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.actions-container {
  display: flex;
  gap: 0.5rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.certificate-modal {
  background-color: #fff;
  border-radius: 10px;
  overflow: hidden;
}

.certificate-header {
  background: linear-gradient(135deg, #0891b2 0%, #0284c7 100%);
  color: white;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.certificate-logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
  margin-bottom: 0.5rem;
  border-radius: 50%;
  background-color: white;
  padding: 0.5rem;
}

.certificate-header h2 {
  margin: 0;
  font-size: 1.25rem;
  text-align: center;
}

.certificate-number-badge {
  background-color: rgba(255,255,255,0.2);
  padding: 0.35rem 0.75rem;
  border-radius: 50px;
  font-size: 0.875rem;
  margin-top: 0.75rem;
  font-weight: 500;
}

.certificate-body {
  padding: 1.5rem;
}

.certificate-row {
  margin-bottom: 1.25rem;
}

.certificate-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.certificate-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.certificate-field .label {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.certificate-field .value {
  font-size: 1rem;
  color: #0f172a;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.certificate-field .value.expired {
  color: #ef4444;
}

.qr-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #e2e8f0;
}

.qr-code {
  width: 120px;
  height: 120px;
  margin-bottom: 0.75rem;
}

.qr-info {
  font-size: 0.75rem;
  color: #64748b;
  text-align: center;
}

:deep(.certificate-dialog .p-dialog-content) {
  padding: 0;
  overflow: hidden;
}

@media (max-width: 767.98px) {
  .certificate-columns {
    grid-template-columns: 1fr;
  }
  
  .card-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .search-container {
    width: 100%;
    max-width: 100%;
  }
  
  .actions-container {
    flex-direction: column;
  }
}
</style> 