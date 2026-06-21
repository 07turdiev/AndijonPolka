<template>
  <div class="test-questions-container">
    <Accordion :multiple="true">
      <AccordionTab v-for="topic in topics" :key="topic.test_topic_id" :header="topic.topic_name">
        <Button label="Add Question" icon="pi pi-plus" class="p-button-success mb-3" @click="openAddDialog(topic.test_topic_id)" />
        <DataTable :value="questionsByTopic[topic.test_topic_id]" :loading="loadingTopics[topic.test_topic_id]" class="p-datatable-sm">
          <Column field="test_question_id" header="ID" style="width: 80px" />
          <Column field="question" header="Question" />
          <Column field="correct_answer" header="Correct Answer" />
          <Column header="Actions" style="width: 160px">
            <template #body="{ data }">
              <Button icon="pi pi-pencil" class="p-button-rounded p-button-info mr-2" @click="openEditDialog(data, topic.test_topic_id)" />
              <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="confirmDelete(data, topic.test_topic_id)" />
            </template>
          </Column>
        </DataTable>
      </AccordionTab>
    </Accordion>
    <!-- Add Dialog -->
    <Dialog v-model:visible="showAddDialog" header="Add Question" :modal="true" :closable="true" :style="{ width: '500px' }">
      <div class="p-fluid">
        <InputText v-model="newQuestion.question" placeholder="Question" class="mb-2" />
        <InputText v-model="newQuestion.answer_1" placeholder="Answer 1" class="mb-2" />
        <InputText v-model="newQuestion.answer_2" placeholder="Answer 2" class="mb-2" />
        <InputText v-model="newQuestion.answer_3" placeholder="Answer 3" class="mb-2" />
        <InputText v-model="newQuestion.answer_4" placeholder="Answer 4" class="mb-2" />
        <Dropdown v-model="newQuestion.correct_answer" :options="correctAnswerOptionsAdd" placeholder="Correct Answer" class="mb-2" />
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="showAddDialog = false" />
        <Button label="Add" icon="pi pi-check" class="p-button-success" @click="addQuestion" :disabled="!canAddOrEdit(newQuestion)" />
      </template>
    </Dialog>
    <!-- Edit Dialog -->
    <Dialog v-model:visible="showEditDialog" header="Edit Question" :modal="true" :closable="true" :style="{ width: '500px' }">
      <div class="p-fluid">
        <InputText v-model="editQuestion.question" placeholder="Question" class="mb-2" />
        <InputText v-model="editQuestion.answer_1" placeholder="Answer 1" class="mb-2" />
        <InputText v-model="editQuestion.answer_2" placeholder="Answer 2" class="mb-2" />
        <InputText v-model="editQuestion.answer_3" placeholder="Answer 3" class="mb-2" />
        <InputText v-model="editQuestion.answer_4" placeholder="Answer 4" class="mb-2" />
        <Dropdown v-model="editQuestion.correct_answer" :options="correctAnswerOptionsEdit" placeholder="Correct Answer" class="mb-2" />
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="showEditDialog = false" />
        <Button label="Save" icon="pi pi-check" class="p-button-success" @click="updateQuestion" :disabled="!canAddOrEdit(editQuestion)" />
      </template>
    </Dialog>
    <!-- Delete Confirm Dialog -->
    <Dialog v-model:visible="showDeleteDialog" header="Confirm Delete" :modal="true" :closable="false" :style="{ width: '350px' }">
      <span>Are you sure you want to delete this question?</span>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="showDeleteDialog = false" />
        <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="deleteQuestion" />
      </template>
    </Dialog>
  </div>
</template>

<script>
import { ref, onMounted, reactive, computed } from 'vue'
import { useStore } from 'vuex'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'

export default {
  name: 'TestQuestions',
  components: { Accordion, AccordionTab },
  setup() {
    const store = useStore()
    const topics = ref([])
    const questionsByTopic = reactive({})
    const loadingTopics = reactive({})
    const showAddDialog = ref(false)
    const showEditDialog = ref(false)
    const showDeleteDialog = ref(false)
    const newQuestion = ref({
      question: '',
      answer_1: '',
      answer_2: '',
      answer_3: '',
      answer_4: '',
      correct_answer: '',
      test_topic_id: null
    })
    const editQuestion = ref({})
    const deleteQuestionId = ref(null)
    const deleteTopicId = ref(null)
    const addToTopicId = ref(null)
    const editTopicId = ref(null)

    const correctAnswerOptionsAdd = computed(() => [
      { label: newQuestion.value.answer_1, value: 'answer_1' },
      { label: newQuestion.value.answer_2, value: 'answer_2' },
      { label: newQuestion.value.answer_3, value: 'answer_3' },
      { label: newQuestion.value.answer_4, value: 'answer_4' }
    ].filter(opt => opt.label))
    const correctAnswerOptionsEdit = computed(() => [
      { label: editQuestion.value.answer_1, value: 'answer_1' },
      { label: editQuestion.value.answer_2, value: 'answer_2' },
      { label: editQuestion.value.answer_3, value: 'answer_3' },
      { label: editQuestion.value.answer_4, value: 'answer_4' }
    ].filter(opt => opt.label))

    const fetchTopicsAndQuestions = async () => {
      topics.value = await store.dispatch('fetchTestTopics')
      for (const topic of topics.value) {
        loadingTopics[topic.test_topic_id] = true
        questionsByTopic[topic.test_topic_id] = await store.dispatch('fetchTestQuestionsByTopic', topic.test_topic_id)
        loadingTopics[topic.test_topic_id] = false
      }
    }

    const openAddDialog = (topicId) => {
      newQuestion.value = {
        question: '',
        answer_1: '',
        answer_2: '',
        answer_3: '',
        answer_4: '',
        correct_answer: '',
        test_topic_id: topicId
      }
      addToTopicId.value = topicId
      showAddDialog.value = true
    }
    const canAddOrEdit = (q) => {
      return q.question && q.answer_1 && q.answer_2 && q.answer_3 && q.answer_4 && q.correct_answer && q.test_topic_id
    }
    const addQuestion = async () => {
    
      // Ensure correct_answer is always 'answer_1', 'answer_2', etc.
      newQuestion.value.correct_answer = newQuestion.value.correct_answer.value
      await store.dispatch('addTestQuestion', newQuestion.value)
      showAddDialog.value = false
      await refreshQuestionsForTopic(addToTopicId.value)
    }
    const openEditDialog = (question, topicId) => {
      editQuestion.value = { ...question }
      editTopicId.value = topicId
      showEditDialog.value = true
    }
    const updateQuestion = async () => {
      // Ensure correct_answer is always 'answer_1', 'answer_2', etc.
      newQuestion.value.correct_answer = newQuestion.value.correct_answer.value

      await store.dispatch('editTestQuestion', { id: editQuestion.value.test_question_id, questionData: editQuestion.value })
      showEditDialog.value = false
      await refreshQuestionsForTopic(editTopicId.value)
    }
    const confirmDelete = (question, topicId) => {
      deleteQuestionId.value = question.test_question_id
      deleteTopicId.value = topicId
      showDeleteDialog.value = true
    }
    const deleteQuestion = async () => {
      await store.dispatch('deleteTestQuestion', deleteQuestionId.value)
      showDeleteDialog.value = false
      await refreshQuestionsForTopic(deleteTopicId.value)
    }
    const refreshQuestionsForTopic = async (topicId) => {
      loadingTopics[topicId] = true
      questionsByTopic[topicId] = await store.dispatch('fetchTestQuestionsByTopic', topicId)
      loadingTopics[topicId] = false
    }

    onMounted(fetchTopicsAndQuestions)

    return {
      topics,
      questionsByTopic,
      loadingTopics,
      showAddDialog,
      showEditDialog,
      showDeleteDialog,
      newQuestion,
      editQuestion,
      correctAnswerOptionsAdd,
      correctAnswerOptionsEdit,
      openAddDialog,
      addQuestion,
      openEditDialog,
      updateQuestion,
      confirmDelete,
      deleteQuestion,
      canAddOrEdit
    }
  }
}
</script>

<style scoped>
.test-questions-container {
  padding: 2rem;
}
.mb-3 {
  margin-bottom: 1.5rem;
}
</style> 