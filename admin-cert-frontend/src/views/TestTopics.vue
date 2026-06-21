<template>
  <div class="test-topics-container">
    <Button label="Add Topic" icon="pi pi-plus" class="p-button-success mb-3" @click="openAddDialog" />
    <DataTable :value="topics" :loading="loading" class="p-datatable-sm">
      <Column field="test_topic_id" header="ID" style="width: 80px" />
      <Column field="topic_name" header="Topic Name" />
      <Column header="Quarter" style="width: 200px">
        <template #body="{ data }">
          {{ data.quarter ? data.quarter.name + ' — ' + formatDate(data.quarter.date) : '—' }}
        </template>
      </Column>
      <Column header="Actions" style="width: 160px">
        <template #body="{ data }">
          <Button icon="pi pi-pencil" class="p-button-rounded p-button-info mr-2" @click="openEditDialog(data)" />
          <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="confirmDelete(data)" />
        </template>
      </Column>
    </DataTable>
    <!-- Add Dialog -->
    <Dialog v-model:visible="showAddDialog" header="Add Topic" :modal="true" :closable="true" :style="{ width: '400px' }">
      <div class="p-fluid">
        <div class="field mb-3">
          <label>Topic Name</label>
          <InputText v-model="newTopic.topic_name" placeholder="Topic Name" class="w-full" />
        </div>
        <div class="field">
          <label>Quarter (Chorak)</label>
          <Dropdown v-model="newTopic.quarter_id" :options="quarters" optionLabel="label" optionValue="value" placeholder="Select Quarter" class="w-full" showClear />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="showAddDialog = false" />
        <Button label="Add" icon="pi pi-check" class="p-button-success" @click="addTopic" :disabled="!newTopic.topic_name" />
      </template>
    </Dialog>
    <!-- Edit Dialog -->
    <Dialog v-model:visible="showEditDialog" header="Edit Topic" :modal="true" :closable="true" :style="{ width: '400px' }">
      <div class="p-fluid">
        <div class="field mb-3">
          <label>Topic Name</label>
          <InputText v-model="editTopic.topic_name" placeholder="Topic Name" class="w-full" />
        </div>
        <div class="field">
          <label>Quarter (Chorak)</label>
          <Dropdown v-model="editTopic.quarter_id" :options="quarters" optionLabel="label" optionValue="value" placeholder="Select Quarter" class="w-full" showClear />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="showEditDialog = false" />
        <Button label="Save" icon="pi pi-check" class="p-button-success" @click="updateTopic" :disabled="!editTopic.topic_name" />
      </template>
    </Dialog>
    <!-- Delete Confirm Dialog -->
    <Dialog v-model:visible="showDeleteDialog" header="Confirm Delete" :modal="true" :closable="false" :style="{ width: '350px' }">
      <span>Are you sure you want to delete this topic?</span>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="showDeleteDialog = false" />
        <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="deleteTopic" />
      </template>
    </Dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'TestTopics',
  setup() {
    const store = useStore()
    const topics = ref([])
    const quarters = ref([])
    const loading = ref(false)
    const showAddDialog = ref(false)
    const showEditDialog = ref(false)
    const showDeleteDialog = ref(false)
    const newTopic = ref({ topic_name: '', quarter_id: null })
    const editTopic = ref({})
    const deleteTopicId = ref(null)

    const formatDate = (isoString) => {
      if (!isoString) return ''
      const d = new Date(isoString)
      const dd = String(d.getDate()).padStart(2, '0')
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const yyyy = d.getFullYear()
      return `${dd}.${mm}.${yyyy}`
    }

    const fetchQuarters = async () => {
      try {
        const result = await store.dispatch('fetchQuarters', { offset: 0, limit: 100 })
        const list = (result && result.data) ? result.data : []
        quarters.value = list.map(q => ({
          label: q.name + ' — ' + formatDate(q.date),
          value: q.quarter_id
        }))
      } catch (e) {
        quarters.value = []
      }
    }

    const fetchTopics = async () => {
      loading.value = true
      topics.value = await store.dispatch('fetchTestTopics')
      loading.value = false
    }

    const openAddDialog = () => {
      newTopic.value = { topic_name: '', quarter_id: null }
      showAddDialog.value = true
    }
    const addTopic = async () => {
      await store.dispatch('addTestTopic', newTopic.value)
      showAddDialog.value = false
      fetchTopics()
    }
    const openEditDialog = (topic) => {
      editTopic.value = { ...topic, quarter_id: topic.quarter_id || null }
      showEditDialog.value = true
    }
    const updateTopic = async () => {
      await store.dispatch('editTestTopic', { id: editTopic.value.test_topic_id, topicData: editTopic.value })
      showEditDialog.value = false
      fetchTopics()
    }
    const confirmDelete = (topic) => {
      deleteTopicId.value = topic.test_topic_id
      showDeleteDialog.value = true
    }
    const deleteTopic = async () => {
      await store.dispatch('deleteTestTopic', deleteTopicId.value)
      showDeleteDialog.value = false
      fetchTopics()
    }

    onMounted(() => {
      fetchTopics()
      fetchQuarters()
    })

    return {
      topics,
      quarters,
      loading,
      showAddDialog,
      showEditDialog,
      showDeleteDialog,
      newTopic,
      editTopic,
      openAddDialog,
      addTopic,
      openEditDialog,
      updateTopic,
      confirmDelete,
      deleteTopic,
      formatDate
    }
  }
}
</script>

<style scoped>
.test-topics-container {
  padding: 2rem;
}
.mb-3 {
  margin-bottom: 1.5rem;
}
</style> 