<template>
  <div class="quarters-container">
    <Card>
      <template #title>
        <div class="card-title">
          <span>{{ $t('quarters') }}</span>
          <div class="actions-container">
            <Button icon="pi pi-plus" 
                   :label="$t('add_quarter')" 
                   class="p-button-sm p-button-success"
                   @click="showAddDialog = true" />
          </div>
        </div>
      </template>
      <template #content>
        <div v-if="loading" class="loading-container">
          <ProgressSpinner />
        </div>
        <DataTable v-else :value="quarters" :lazy="true" :paginator="true" :rows="rowsPerPage"
                  :totalRecords="totalRecords"
                  :rowsPerPageOptions="[10, 20, 50, 100]"
                  v-model:first="first"
                  v-model:rows="rowsPerPage"
                  @page="onPage($event)"
                  :loading="loading"
                  responsiveLayout="scroll" stripedRows class="quarters-table"
                  :rowHover="true" currentPageReportTemplate="{first}-{last} / {totalRecords}"
                  paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown">
          <Column field="name" :header="$t('quarter_name')" sortable></Column>
          <Column field="date" :header="$t('quarter_date')" sortable>
            <template #body="slotProps">
              {{ formatDate(slotProps.data.date) }}
            </template>
          </Column>
          <Column field="status" :header="$t('status')" sortable>
            <template #body="slotProps">
              <Badge :value="$t(slotProps.data.status)" 
                     :severity="slotProps.data.status === 'active' ? 'success' : 'secondary'" />
            </template>
          </Column>
          <Column :header="$t('actions')" :style="{width: '150px'}">
            <template #body="slotProps">
              <div class="action-buttons">
                <Button icon="pi pi-pencil" 
                       class="p-button-text p-button-sm p-button-warning"
                       @click="editQuarter(slotProps.data)"
                       v-tooltip.top="$t('edit')" />
                <Button icon="pi pi-trash" 
                       class="p-button-text p-button-sm p-button-danger"
                       @click="confirmDelete(slotProps.data)"
                       v-tooltip.top="$t('delete')" />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Add/Edit Quarter Dialog -->
    <Dialog v-model:visible="showAddDialog" :header="isEditing ? $t('edit_quarter') : $t('add_quarter')" 
            :style="{width: '500px'}" :modal="true" class="quarter-dialog">
      <div class="quarter-form">
        <div class="form-group">
          <label for="quarterName">{{ $t('quarter_name') }} *</label>
          <InputText id="quarterName" v-model="quarterForm.name" 
                     :placeholder="$t('enter_quarter_name')" 
                     :class="{'p-invalid': errors.name}" />
          <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
        </div>
        
        <div class="form-group">
          <label for="quarterDate">{{ $t('quarter_date') }} *</label>
          <Calendar id="quarterDate" v-model="quarterForm.date" 
                    dateFormat="dd.mm.yy" 
                    :showIcon="true"
                    :class="{'p-invalid': errors.date}" />
          <small v-if="errors.date" class="p-error">{{ errors.date }}</small>
        </div>
        
        <div class="form-group">
          <label for="quarterStatus">{{ $t('status') }}</label>
          <Dropdown id="quarterStatus" v-model="quarterForm.status" 
                    :options="statusOptions" 
                    optionLabel="label" 
                    optionValue="value"
                    :placeholder="$t('select_status')" />
        </div>
      </div>
      <template #footer>
        <Button :label="$t('cancel')" icon="pi pi-times" @click="closeDialog" class="p-button-text" />
        <Button :label="isEditing ? $t('update') : $t('save')" 
               icon="pi pi-check" 
               @click="saveQuarter" 
               :loading="saving"
               class="p-button-success" />
      </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:visible="showDeleteDialog" :header="$t('confirm_delete')" 
            :style="{width: '400px'}" :modal="true">
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: #f59e0b;"></i>
        <span>{{ $t('delete_quarter_confirmation', { name: selectedQuarter && selectedQuarter.name }) }}</span>
      </div>
      <template #footer>
        <Button :label="$t('cancel')" icon="pi pi-times" @click="showDeleteDialog = false" class="p-button-text" />
        <Button :label="$t('delete')" icon="pi pi-trash" @click="deleteQuarter" 
               :loading="deleting" class="p-button-danger" />
      </template>
    </Dialog>
  </div>
</template>

<script>
import { ref, onMounted, inject } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'primevue/usetoast'
import Calendar from 'primevue/calendar'

export default {
  name: 'Quarters',
  components: {
    Calendar
  },
  setup() {
    const store = useStore()
    const toast = useToast()
    const i18n = inject('i18n')
    
    const loading = ref(true)
    const saving = ref(false)
    const deleting = ref(false)
    const quarters = ref([])
    
    const first = ref(0)
    const rowsPerPage = ref(10)
    const totalRecords = ref(0)
    
    const showAddDialog = ref(false)
    const showDeleteDialog = ref(false)
    const isEditing = ref(false)
    const selectedQuarter = ref(null)
    
    const quarterForm = ref({
      name: '',
      date: null,
      status: 'active'
    })
    
    const errors = ref({})
    
    const statusOptions = [
      { label: i18n.t('active'), value: 'active' },
      { label: i18n.t('inactive'), value: 'inactive' }
    ]
    
    const onPage = (event) => {
      first.value = event.first
      rowsPerPage.value = event.rows
      fetchQuarters()
    }
    
    const fetchQuarters = async () => {
      loading.value = true
      try {
        const result = await store.dispatch('fetchQuarters', {
          offset: first.value,
          limit: rowsPerPage.value
        })
        
        console.log('Fetch quarters result:', result)
        
        if (result && typeof result === 'object') {
          quarters.value = result.data || []
          totalRecords.value = result.totalRecords || 0
          console.log('Quarters set to:', quarters.value)
        } else {
          quarters.value = []
          totalRecords.value = 0
        }
      } catch (error) {
        console.error('Fetch quarters error:', error)
        toast.add({
          severity: 'error',
          summary: i18n.t('error'),
          detail: i18n.t('fetch_quarters_failed') + ': ' + (error.response && error.response.data && error.response.data.message || error.message),
          life: 5000
        })
        quarters.value = []
        totalRecords.value = 0
      } finally {
        loading.value = false
      }
    }
    
    const validateForm = () => {
      errors.value = {}
      
      if (!quarterForm.value.name || !quarterForm.value.name.trim()) {
        errors.value.name = i18n.t('quarter_name_required')
      }
      
      if (!quarterForm.value.date) {
        errors.value.date = i18n.t('quarter_date_required')
      }
      
      return Object.keys(errors.value).length === 0
    }
    
    const saveQuarter = async () => {
      if (!validateForm()) {
        return
      }
      
      saving.value = true
      try {
        const rawDate = quarterForm.value.date
        const localDateStr = rawDate instanceof Date
          ? `${rawDate.getFullYear()}-${String(rawDate.getMonth() + 1).padStart(2, '0')}-${String(rawDate.getDate()).padStart(2, '0')}`
          : rawDate
        const quarterData = {
          name: quarterForm.value.name.trim(),
          date: localDateStr,
          status: quarterForm.value.status
        }
        
        let result
        if (isEditing.value) {
          result = await store.dispatch('editQuarter', {
            id: selectedQuarter.value.quarter_id,
            quarterData
          })
        } else {
          result = await store.dispatch('addQuarter', quarterData)
        }
        
        if (result && result.success) {
          toast.add({
            severity: 'success',
            summary: i18n.t('success'),
            detail: isEditing.value ? i18n.t('quarter_updated_successfully') : i18n.t('quarter_added_successfully'),
            life: 3000
          })
          closeDialog()
          // Refresh the quarters list
          await fetchQuarters()
        } else {
          toast.add({
            severity: 'error',
            summary: i18n.t('error'),
            detail: (result && result.error) || i18n.t('save_failed'),
            life: 5000
          })
        }
      } catch (error) {
        console.error('Save quarter error:', error)
        toast.add({
          severity: 'error',
          summary: i18n.t('error'),
          detail: i18n.t('save_failed') + ': ' + (error.response && error.response.data && error.response.data.message || error.message),
          life: 5000
        })
      } finally {
        saving.value = false
      }
    }
    
    const editQuarter = (quarter) => {
      selectedQuarter.value = quarter
      isEditing.value = true
      quarterForm.value = {
        name: quarter.name,
        date: new Date(quarter.date),
        status: quarter.status
      }
      showAddDialog.value = true
    }
    
    const confirmDelete = (quarter) => {
      selectedQuarter.value = quarter
      showDeleteDialog.value = true
    }
    
    const deleteQuarter = async () => {
      if (!selectedQuarter.value) return
      
      deleting.value = true
      try {
        const result = await store.dispatch('deleteQuarter', selectedQuarter.value.quarter_id)
        
        if (result && result.success) {
          toast.add({
            severity: 'success',
            summary: i18n.t('success'),
            detail: i18n.t('quarter_deleted_successfully'),
            life: 3000
          })
          showDeleteDialog.value = false
          fetchQuarters()
        } else {
          toast.add({
            severity: 'error',
            summary: i18n.t('error'),
            detail: (result && result.error) || i18n.t('delete_failed'),
            life: 3000
          })
        }
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: i18n.t('error'),
          detail: i18n.t('delete_failed'),
          life: 3000
        })
      } finally {
        deleting.value = false
      }
    }
    
    const closeDialog = () => {
      showAddDialog.value = false
      isEditing.value = false
      selectedQuarter.value = null
      quarterForm.value = {
        name: '',
        date: null,
        status: 'active'
      }
      errors.value = {}
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      // Faqat sana qismini olamiz (timezone ta'sirini oldini olish uchun)
      const part = String(dateString).substring(0, 10) // "YYYY-MM-DD"
      if (part.length === 10) {
        const [y, m, d] = part.split('-')
        return `${d}.${m}.${y}`
      }
      return new Date(dateString).toLocaleDateString()
    }
    
    onMounted(async () => {
      // Test token first
      console.log('Current token:', store.getters.getToken)
      console.log('Token from localStorage:', localStorage.getItem('adminToken'))
      
      await fetchQuarters()
    })
    
    return {
      loading,
      saving,
      deleting,
      quarters,
      first,
      rowsPerPage,
      totalRecords,
      onPage,
      showAddDialog,
      showDeleteDialog,
      isEditing,
      selectedQuarter,
      quarterForm,
      errors,
      statusOptions,
      saveQuarter,
      editQuarter,
      confirmDelete,
      deleteQuarter,
      closeDialog,
      formatDate
    }
  }
}
</script>

<style scoped>
.quarters-container {
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

.actions-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.quarter-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #374151;
}

.confirmation-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
}

:deep(.quarters-table .p-datatable-tbody > tr > td) {
  padding: 1rem 0.75rem;
}

:deep(.quarter-dialog .p-dialog-content) {
  padding: 1.5rem;
}
</style>
