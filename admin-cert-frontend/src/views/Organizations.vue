<template>
  <div class="organizations-container">
    <Card>
      <template #title>
        <div class="card-title">
          <span>{{ $t('organizations') }}</span>
          <Button icon="pi pi-plus" 
                 :label="$t('add_new')" 
                 class="p-button-sm"
                 @click="openNewOrganizationDialog" />
        </div>
      </template>
      <template #content>
        <!-- Filters Section -->
        <div class="filters-section">
          <div class="filter-container">
            <span class="p-input-icon-left search-input">
              <InputText v-model="filters.searchWord" 
                         :placeholder="$t('search')" 
                         @input="applyFiltersDebounced"
                         class="p-inputtext-sm"/>
            </span>
          </div>
          
          <div class="filter-container">
            <Dropdown v-model="filters.region_id" 
                      :options="regionOptions" 
                      :placeholder="$t('region')"
                      optionLabel="label" 
                      optionValue="value"
                      @change="applyFilters"
                      :loading="regionsLoading"
                      class="p-inputtext-sm filter-dropdown" />
          </div>
          
          <div class="filter-container">
            <Button icon="pi pi-filter-slash" 
                   :label="$t('clear_filters')" 
                   class="p-button-outlined p-button-sm"
                   @click="clearFilters" />
          </div>
        </div>
        
        <div v-if="loading" class="loading-container">
          <ProgressSpinner />
        </div>
        <DataTable v-else :value="organizations" 
                  :lazy="true"
                  :paginator="true" 
                  :rows="rowsPerPage"
                  :totalRecords="totalRecords"
                  :rowsPerPageOptions="[5, 10, 20, 50]"
                  v-model:first="first"
                  v-model:rows="rowsPerPage"
                  @page="onPage($event)"
                  :loading="loading"
                  responsiveLayout="scroll" 
                  stripedRows 
                  class="organizations-table"
                  :rowHover="true" 
                  currentPageReportTemplate="{first}-{last} / {totalRecords}"
                  paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                  @row-click="onRowClick" 
                  selectionMode="single">
          <Column field="organization_id" :header="$t('id')" sortable></Column>
          <Column field="name_uz" :header="$t('organization_name')" sortable></Column>
          <Column field="inn" :header="$t('inn')" sortable></Column>
          <Column field="region_id" :header="$t('region')">
            <template #body="slotProps">
              {{ getRegionName(slotProps.data.region_id) }}
            </template>
          </Column>
          <Column field="cadastral_number" :header="$t('cadastral_number')"></Column>
          <Column :header="$t('actions')">
            <template #body="slotProps">
              <div class="action-buttons">
                <Button icon="pi pi-pencil" 
                       class="p-button-rounded p-button-warning p-button-sm mr-2"
                       @click.stop="openEditOrganizationDialog(slotProps.data)" />
                <Button icon="pi pi-trash" 
                       class="p-button-rounded p-button-danger p-button-sm"
                       @click.stop="confirmDeleteOrganization(slotProps.data)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Organization Detail Dialog -->
    <Dialog v-model:visible="showDetailDialog" :header="$t('organization_details')" :style="{width: '650px'}" :modal="true" class="organization-detail-dialog">
      <div v-if="selectedOrganization" class="organization-detail-container">
        <div class="organization-header">
          <div class="organization-icon">
            <i class="pi pi-building" style="font-size: 3rem"></i>
          </div>
          <div class="organization-header-info">
            <h2>{{ selectedOrganization.name_uz }}</h2>
            <div class="organization-id">#{{ selectedOrganization.organization_id }}</div>
          </div>
        </div>
        
        <div class="organization-body">
          <div class="detail-section">
            <h3>{{ $t('organization_information') }}</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">{{ $t('organization_name_uz') }}</span>
                <span class="detail-value">{{ selectedOrganization.name_uz }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ $t('organization_name_ru') }}</span>
                <span class="detail-value">{{ selectedOrganization.name_ru || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ $t('organization_name_en') }}</span>
                <span class="detail-value">{{ selectedOrganization.name_en || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ $t('inn') }}</span>
                <span class="detail-value">{{ selectedOrganization.inn || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ $t('cadastral_number') }}</span>
                <span class="detail-value">{{ selectedOrganization.cadastral_number || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ $t('region') }}</span>
                <span class="detail-value">{{ getRegionName(selectedOrganization.region_id) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ $t('global_id') }}</span>
                <span class="detail-value">{{ selectedOrganization.global_id || '-' }}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section" v-if="selectedOrganization.direction_uz || selectedOrganization.direction_ru || selectedOrganization.direction_en">
            <h3>{{ $t('additional_information') }}</h3>
            <div class="detail-grid">
              <div class="detail-item" v-if="selectedOrganization.direction_uz">
                <span class="detail-label">{{ $t('direction_uz') }}</span>
                <span class="detail-value">{{ selectedOrganization.direction_uz }}</span>
              </div>
              <div class="detail-item" v-if="selectedOrganization.direction_ru">
                <span class="detail-label">{{ $t('direction_ru') }}</span>
                <span class="detail-value">{{ selectedOrganization.direction_ru }}</span>
              </div>
              <div class="detail-item" v-if="selectedOrganization.direction_en">
                <span class="detail-label">{{ $t('direction_en') }}</span>
                <span class="detail-value">{{ selectedOrganization.direction_en }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <Button :label="$t('close')" icon="pi pi-times" @click="showDetailDialog = false" class="p-button-text" />
      </template>
    </Dialog>

    <!-- Add New Organization Dialog -->
    <Dialog v-model:visible="showAddDialog" :header="$t('add_organization')" :style="{width: '650px'}" :modal="true" class="organization-add-dialog">
      <div class="p-fluid">
        <div class="field">
          <label for="name_uz" class="required-field">{{ $t('name_uz') }}</label>
          <InputText id="name_uz" v-model="newOrganization.name_uz" type="text" :class="{'p-invalid': submitted && !newOrganization.name_uz}" />
          <small v-if="submitted && !newOrganization.name_uz" class="p-error">{{ $t('field_required') }}</small>
        </div>
        
        <div class="field">
          <label for="name_ru">{{ $t('name_ru') }}</label>
          <InputText id="name_ru" v-model="newOrganization.name_ru" type="text" />
        </div>
        
        <div class="field">
          <label for="name_en">{{ $t('name_en') }}</label>
          <InputText id="name_en" v-model="newOrganization.name_en" type="text" />
        </div>
        
        <div class="field">
          <label for="inn" class="required-field">{{ $t('inn') }}</label>
          <InputText id="inn" v-model="newOrganization.inn" type="text" :class="{'p-invalid': submitted && !newOrganization.inn}" />
          <small v-if="submitted && !newOrganization.inn" class="p-error">{{ $t('field_required') }}</small>
        </div>
        
        <div class="field">
          <label for="global_id" class="required-field">{{ $t('global_id') }}</label>
          <InputText id="global_id" v-model="newOrganization.global_id" type="text" :class="{'p-invalid': submitted && !newOrganization.global_id}" />
          <small v-if="submitted && !newOrganization.global_id" class="p-error">{{ $t('field_required') }}</small>
        </div>
        
        <div class="field">
          <label for="cadastral_number">{{ $t('cadastral_number') }}</label>
          <InputText id="cadastral_number" v-model="newOrganization.cadastral_number" type="text" />
        </div>
        
        <div class="field">
          <label for="direction_uz">{{ $t('direction_uz') }}</label>
          <InputText id="direction_uz" v-model="newOrganization.direction_uz" type="text" />
        </div>
        
        <div class="field">
          <label for="direction_ru">{{ $t('direction_ru') }}</label>
          <InputText id="direction_ru" v-model="newOrganization.direction_ru" type="text" />
        </div>
        
        <div class="field">
          <label for="direction_en">{{ $t('direction_en') }}</label>
          <InputText id="direction_en" v-model="newOrganization.direction_en" type="text" />
        </div>
        
        <div class="field">
          <label for="region_id">{{ $t('region') }}</label>
          <Dropdown id="region_id" 
                   v-model="newOrganization.region_id" 
                   :options="regions" 
                   optionLabel="name_uz" 
                   optionValue="region_id"
                   :placeholder="$t('select_region')" />
        </div>
      </div>
      
      <template #footer>
        <Button :label="$t('cancel')" icon="pi pi-times" @click="showAddDialog = false" class="p-button-text" />
        <Button :label="$t('save')" icon="pi pi-check" @click="saveOrganization" :loading="saving" />
      </template>
    </Dialog>

    <!-- Edit Organization Dialog -->
    <Dialog v-model:visible="showEditDialog" :header="$t('edit_organization')" :style="{width: '650px'}" :modal="true" class="organization-edit-dialog">
      <div class="p-fluid" v-if="editingOrganization">
        <div class="field">
          <label for="edit_name_uz" class="required-field">{{ $t('name_uz') }}</label>
          <InputText id="edit_name_uz" v-model="editingOrganization.name_uz" type="text" :class="{'p-invalid': submitted && !editingOrganization.name_uz}" />
          <small v-if="submitted && !editingOrganization.name_uz" class="p-error">{{ $t('field_required') }}</small>
        </div>
        
        <div class="field">
          <label for="edit_name_ru">{{ $t('name_ru') }}</label>
          <InputText id="edit_name_ru" v-model="editingOrganization.name_ru" type="text" />
        </div>
        
        <div class="field">
          <label for="edit_name_en">{{ $t('name_en') }}</label>
          <InputText id="edit_name_en" v-model="editingOrganization.name_en" type="text" />
        </div>
        
        <div class="field">
          <label for="edit_inn" class="required-field">{{ $t('inn') }}</label>
          <InputText id="edit_inn" v-model="editingOrganization.inn" type="text" :class="{'p-invalid': submitted && !editingOrganization.inn}" />
          <small v-if="submitted && !editingOrganization.inn" class="p-error">{{ $t('field_required') }}</small>
        </div>
        
        <div class="field">
          <label for="edit_cadastral_number">{{ $t('cadastral_number') }}</label>
          <InputText id="edit_cadastral_number" v-model="editingOrganization.cadastral_number" type="text" />
        </div>
        
        <div class="field">
          <label for="edit_direction_uz">{{ $t('direction_uz') }}</label>
          <Textarea id="edit_direction_uz" v-model="editingOrganization.direction_uz" rows="3" autoResize />
        </div>
        
        <div class="field">
          <label for="edit_direction_ru">{{ $t('direction_ru') }}</label>
          <Textarea id="edit_direction_ru" v-model="editingOrganization.direction_ru" rows="3" autoResize />
        </div>
        
        <div class="field">
          <label for="edit_direction_en">{{ $t('direction_en') }}</label>
          <Textarea id="edit_direction_en" v-model="editingOrganization.direction_en" rows="3" autoResize />
        </div>
        
        <div class="field">
          <label for="edit_region_id" class="required-field">{{ $t('region') }}</label>
          <Dropdown id="edit_region_id" 
                   v-model="editingOrganization.region_id" 
                   :options="regions" 
                   optionLabel="name_uz" 
                   optionValue="region_id"
                   :placeholder="$t('select_region')" />
        </div>
      </div>
      
      <template #footer>
        <Button :label="$t('cancel')" icon="pi pi-times" @click="showEditDialog = false" class="p-button-text" />
        <Button :label="$t('save')" icon="pi pi-check" @click="updateOrganization" :loading="saving" />
      </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:visible="showDeleteDialog" :header="$t('confirm_delete')" :style="{width: '450px'}" :modal="true">
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem; color: var(--yellow-500);" />
        <span v-if="organizationToDelete">{{ $t('delete_organization_confirmation', {name: organizationToDelete.name_uz}) }}</span>
      </div>
      <template #footer>
        <Button :label="$t('no')" icon="pi pi-times" @click="showDeleteDialog = false" class="p-button-text" />
        <Button :label="$t('yes')" icon="pi pi-check" @click="deleteOrganization" :loading="deleting" class="p-button-danger" />
      </template>
    </Dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, inject, reactive } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'primevue/usetoast'

export default {
  name: 'Organizations',
  setup() {
    const store = useStore()
    const toast = useToast()
    const i18n = inject('i18n')
    
    const loading = ref(true)
    const regionsLoading = ref(true)
    const organizations = ref([])
    const regions = computed(() => store.state.regions)
    
    // Pagination
    const first = ref(0)
    const rowsPerPage = ref(10)
    const totalRecords = ref(0)
    
    // Organization details dialog
    const showDetailDialog = ref(false)
    const selectedOrganization = ref(null)
    
    // Add new organization dialog
    const showAddDialog = ref(false)
    const saving = ref(false)
    const submitted = ref(false)
    const newOrganization = reactive({
      name_uz: '',
      name_ru: '',
      name_en: '',
      inn: '',
      cadastral_number: '',
      region_id: null,
      direction_uz: '',
      direction_ru: '',
      direction_en: '',
      global_id: ''
    })
    
    // Edit organization dialog
    const showEditDialog = ref(false)
    const editingOrganization = ref(null)
    
    // Delete organization dialog
    const showDeleteDialog = ref(false)
    const organizationToDelete = ref(null)
    const deleting = ref(false)
    
    // Filter state
    const filters = ref({
      searchWord: '',
      region_id: null
    })
    
    // Open add new organization dialog
    const openNewOrganizationDialog = () => {
      // Reset form
      Object.keys(newOrganization).forEach(key => {
        newOrganization[key] = key === 'region_id' ? null : ''
      })
      submitted.value = false
      showAddDialog.value = true
    }
    
    // Open edit organization dialog
    const openEditOrganizationDialog = (organization) => {
      // Clone the organization to avoid direct mutation
      editingOrganization.value = { ...organization }
      submitted.value = false
      showEditDialog.value = true
    }
    
    // Open delete confirmation dialog
    const confirmDeleteOrganization = (organization) => {
      organizationToDelete.value = organization
      showDeleteDialog.value = true
    }
    
    // Save new organization
    const saveOrganization = async () => {
      submitted.value = true
      
      // Validate required fields
      if (!newOrganization.name_uz || !newOrganization.inn || !newOrganization.global_id) {
        toast.add({
          severity: 'error',
          summary: i18n.t('error'),
          detail: i18n.t('required_fields_missing'),
          life: 3000
        })
        return
      }
      
      saving.value = true
      
      try {
        const result = await store.dispatch('addOrganization', newOrganization)
        
        if (result.success) {
          toast.add({
            severity: 'success',
            summary: i18n.t('success'),
            detail: i18n.t('organization_added_successfully'),
            life: 3000
          })
          
          showAddDialog.value = false
          
          // Refresh data
          applyFilters()
        } else {
          toast.add({
            severity: 'error',
            summary: i18n.t('error'),
            detail: i18n.t('failed_to_add_organization'),
            life: 3000
          })
        }
      } catch (error) {
        console.error('Error saving organization:', error)
        toast.add({
          severity: 'error',
          summary: i18n.t('error'),
          detail: i18n.t('failed_to_add_organization'),
          life: 3000
        })
      } finally {
        saving.value = false
      }
    }
    
    // Update organization
    const updateOrganization = async () => {
      submitted.value = true
      
      // Validate required fields
      if (!editingOrganization.value.name_uz || !editingOrganization.value.inn || !editingOrganization.value.region_id) {
        toast.add({
          severity: 'error',
          summary: i18n.t('error'),
          detail: i18n.t('required_fields_missing'),
          life: 3000
        })
        return
      }
      
      saving.value = true
      
      try {
        const result = await store.dispatch('editOrganization', {
          id: editingOrganization.value.organization_id,
          organizationData: {
            name_uz: editingOrganization.value.name_uz,
            name_ru: editingOrganization.value.name_ru,
            name_en: editingOrganization.value.name_en,
            direction_uz: editingOrganization.value.direction_uz,
            direction_ru: editingOrganization.value.direction_ru,
            direction_en: editingOrganization.value.direction_en,
            cadastral_number: editingOrganization.value.cadastral_number,
            inn: editingOrganization.value.inn,
            region_id: editingOrganization.value.region_id
          }
        })
        
        if (result.success) {
          toast.add({
            severity: 'success',
            summary: i18n.t('success'),
            detail: i18n.t('organization_updated_successfully'),
            life: 3000
          })
          
          showEditDialog.value = false
          
          // Refresh data
          applyFilters()
        } else {
          toast.add({
            severity: 'error',
            summary: i18n.t('error'),
            detail: i18n.t('failed_to_update_organization'),
            life: 3000
          })
        }
      } catch (error) {
        console.error('Error updating organization:', error)
        toast.add({
          severity: 'error',
          summary: i18n.t('error'),
          detail: i18n.t('failed_to_update_organization'),
          life: 3000
        })
      } finally {
        saving.value = false
      }
    }
    
    // Delete organization
    const deleteOrganization = async () => {
      if (!organizationToDelete.value) return
      
      deleting.value = true
      
      try {
        const result = await store.dispatch('deleteOrganization', organizationToDelete.value.organization_id)
        
        if (result.success) {
          toast.add({
            severity: 'success',
            summary: i18n.t('success'),
            detail: i18n.t('organization_deleted_successfully'),
            life: 3000
          })
          
          showDeleteDialog.value = false
          
          // Refresh data
          applyFilters()
        } else {
          toast.add({
            severity: 'error',
            summary: i18n.t('error'),
            detail: i18n.t('failed_to_delete_organization'),
            life: 3000
          })
        }
      } catch (error) {
        console.error('Error deleting organization:', error)
        toast.add({
          severity: 'error',
          summary: i18n.t('error'),
          detail: i18n.t('failed_to_delete_organization'),
          life: 3000
        })
      } finally {
        deleting.value = false
        organizationToDelete.value = null
      }
    }
    
    // Region options for dropdown, built from fetched regions
    const regionOptions = computed(() => {
      const options = [{ label: i18n.t('all_regions'), value: null }]
      if (regions.value && regions.value.length) {
        regions.value.forEach(region => {
          options.push({
            label: region.name_uz, // Using Uzbek name by default
            value: region.region_id
          })
        })
      }
      return options
    })
    
    // Get region name by ID
    const getRegionName = (regionId) => {
      if (!regionId) return '-'
      const region = regions.value.find(r => r.region_id === regionId)
      return region ? region.name_uz : '-'
    }
    
    // Debounce function for search input
    let debounceTimer
    const applyFiltersDebounced = () => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        applyFilters()
      }, 300)
    }
    
    // Apply filters and fetch data
    const applyFilters = async () => {
      loading.value = true
      
      const offset = first.value
      
      const result = await store.dispatch('fetchOrganizations', { 
        searchWord: filters.value.searchWord,
        region_id: filters.value.region_id,
        offset: offset,
        limit: rowsPerPage.value
      })
      
      organizations.value = result.data
      totalRecords.value = result.totalRecords
      
      loading.value = false
    }
    
    // Handle pagination
    const onPage = (event) => {
      first.value = event.first
      rowsPerPage.value = event.rows
      applyFilters()
    }
    
    // Clear all filters
    const clearFilters = () => {
      filters.value = {
        searchWord: '',
        region_id: null
      }
      first.value = 0
      applyFilters()
    }
    
    // Handle row click to show details
    const onRowClick = (event) => {
      selectedOrganization.value = event.data
      showDetailDialog.value = true
    }
    
    onMounted(async () => {
      loading.value = true
      regionsLoading.value = true
      
      // Fetch regions
      await store.dispatch('fetchRegions')
      regionsLoading.value = false
      
      // Fetch organizations with pagination
      const result = await store.dispatch('fetchOrganizations', {
        offset: 0,
        limit: rowsPerPage.value
      })
      
      organizations.value = result.data
      totalRecords.value = result.totalRecords
      
      loading.value = false
    })
    
    return {
      loading,
      regionsLoading,
      organizations,
      regions,
      first,
      rowsPerPage,
      totalRecords,
      onPage,
      showDetailDialog,
      selectedOrganization,
      onRowClick,
      filters,
      regionOptions,
      getRegionName,
      applyFilters,
      applyFiltersDebounced,
      clearFilters,
      // Add organization
      showAddDialog,
      newOrganization,
      openNewOrganizationDialog,
      saveOrganization,
      submitted,
      saving,
      // Edit organization
      showEditDialog,
      editingOrganization,
      openEditOrganizationDialog,
      updateOrganization,
      // Delete organization
      showDeleteDialog,
      organizationToDelete,
      confirmDeleteOrganization,
      deleteOrganization,
      deleting
    }
  }
}
</script>

<style scoped>
.organizations-container {
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

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

/* Filter styles */
.filters-section {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
}

.filter-container {
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
}

.search-input :deep(input) {
  width: 100%;
}

.filter-dropdown {
  width: 100%;
}

/* Action buttons */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.mr-2 {
  margin-right: 0.5rem;
}

/* Delete confirmation dialog */
.confirmation-content {
  display: flex;
  align-items: center;
  padding: 1rem 0;
}

/* Organization Detail Dialog Styles */
.organization-detail-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.organization-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.organization-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  color: #0284c7;
}

.organization-header-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.organization-header-info h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #1e293b;
}

.organization-id {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.organization-body {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-section h3 {
  margin: 0;
  font-size: 1.125rem;
  color: #1e293b;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
}

.detail-value {
  font-size: 1rem;
  color: #1e293b;
  font-weight: 500;
}

:deep(.organization-detail-dialog .p-dialog-content) {
  padding: 1.5rem;
  overflow: hidden;
}

/* Add/Edit form styles */
.p-fluid .field {
  margin-bottom: 1rem;
}

.required-field:after {
  content: " *";
  color: red;
}

:deep(.organization-add-dialog .p-dialog-content),
:deep(.organization-edit-dialog .p-dialog-content) {
  padding: 0 1.5rem;
}

/* Custom styles for textarea */
:deep(.p-inputtextarea) {
  resize: vertical;
  min-height: 70px;
}

/* Responsive styles */
@media (max-width: 767.98px) {
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-container {
    width: 100%;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .organization-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style> 