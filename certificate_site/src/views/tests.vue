<template>
  <div class="tests-outer">
    <div class="tests-card">
      <div v-if="loading" class="loading-block">
        <span>Loading...</span>
      </div>
      <div v-else>
        <div v-if="!selectedTopic">
          <h2 class="quiz-title">{{ $t('selectTestTopic') }}</h2>
          <div class="topics-list">
            <button v-for="topic in topics" :key="topic.test_topic_id" class="topic-btn" @click="selectTopic(topic)">
              {{ topic.topic_name }}
              <span v-if="topic.quarter" class="topic-quarter">{{ topic.quarter.name }}</span>
            </button>
          </div>
        </div>
        <div v-else-if="maxAttemptsReached">
          <h2 class="quiz-title">{{ $t('attemptsLimitReached') }}</h2>
          <p class="score">{{ $t('attemptsUsed') }}: {{ attempts }} / {{ maxAttempts }}</p>
          <p class="score">{{ $t('outOfLimit') }}</p>
          <p class="score">{{ $t('bestScore') }}: {{ bestScore }}<span v-if="bestAttempt"> / {{
            bestAttempt.number_of_questions }}</span></p>
          <button @click="restartQuiz" class="restart-btn">{{ $t('backToTopics') }}</button>
        </div>
        <div v-else-if="!quizFinished">
          <h2 class="quiz-title">{{ selectedTopic.topic_name }}</h2>
          <p class="score">{{ $t('attemptsUsed') }}: {{ attempts }} / {{ maxAttempts }}</p>
          <div class="question-block">
            <div class="progress-bar">
              <div class="progress-bar-inner" :style="{ width: ((currentIndex + 1) / questions.length * 100) + '%' }">
              </div>
            </div>
            <div class="question-header">
              <span class="question-number">{{ $t('question') }} {{ currentIndex + 1 }} / {{ questions.length }}</span>
            </div>
            <p class="question">{{ currentQuestion.question }}</p>
            <div class="options">
              <button v-for="(option, idx) in currentQuestion.options" :key="idx" class="option-btn"
                :class="{ selected: answers[currentIndex] === idx }" @click="selectOption(idx)">
                {{ option }}
              </button>
            </div>
          </div>
          <div class="quiz-actions">
            <button @click="prevQuestion" :disabled="currentIndex === 0"
              class="nav-btn prev-btn">{{ $t('previous') }}</button>
            <button @click="nextOrFinish" :disabled="answers[currentIndex] === null" class="nav-btn next-btn">
              {{ currentIndex < questions.length - 1 ? $t('next') : $t('finish') }} </button>
          </div>
        </div>
        <div v-else class="result-block">
          <h2 class="quiz-title">{{ $t('quizFinished') }}</h2>
          <p class="score">{{ $t('yourScore') }}: {{ score }} / {{ questions.length }}</p>
          <p class="score">{{ $t('correct') }}: {{ correctCount }}, {{ $t('incorrect') }}: {{ incorrectCount }}</p>
          <button @click="restartQuiz" class="restart-btn">{{ $t('restart') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axiosInstance from '../plugins/axios.js'
export default {
  name: 'Tests',
  data() {
    return {
      topics: [],
      selectedTopic: null,
      questions: [],
      currentIndex: 0,
      answers: [],
      quizFinished: false,
      score: 0,
      correctCount: 0,
      incorrectCount: 0,
      loading: false,
      maxAttemptsReached: false,
      bestScore: 0,
      bestAttempt: null,
      attempts: 0,
      maxAttempts: 3,
    }
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentIndex] || {}
    }
  },
  methods: {
    async fetchTopics() {
      this.loading = true
      try {
        const res = await axiosInstance.get('/test/topics')

        this.topics = res.data.result || res.data || []
      } catch (e) {
        this.topics = []
      }
      this.loading = false
    },
    async selectTopic(topic) {
      this.selectedTopic = topic
      this.loading = true
      this.maxAttemptsReached = false
      this.bestScore = 0
      this.bestAttempt = null
      this.attempts = 0
      try {
        const user_id = localStorage.getItem('user_id')
        // Check attempts
        const attemptRes = await axiosInstance.get('/test/attempts', {
          params: { user_id, test_topic_id: topic.test_topic_id }
        })
        if (attemptRes.data && attemptRes.data.result) {
          this.attempts = attemptRes.data.result.attempts || 0
        }
        if (attemptRes.data && attemptRes.data.result && attemptRes.data.result.attempts >= 3) {
          this.maxAttemptsReached = true
          this.bestScore = attemptRes.data.result.bestScore
          this.bestAttempt = attemptRes.data.result.bestAttempt
          this.loading = false
          return
        }
        const res = await axiosInstance.get(`/test/questions/${topic.test_topic_id}`)
        // Debug log to check API response
        this.questions = (res.data.result || res.data || []).map(q => ({
          ...q,
          options: [q.answer_1, q.answer_2, q.answer_3, q.answer_4].filter(opt => opt !== undefined && opt !== null)
        }))
        this.answers = Array(this.questions.length).fill(null)
        this.currentIndex = 0
        this.quizFinished = false
        this.score = 0
        this.correctCount = 0
        this.incorrectCount = 0
      } catch (e) {
        this.questions = []
      }
      this.loading = false
    },
    selectOption(idx) {
      this.answers[this.currentIndex] = idx
    },
    nextOrFinish() {
      if (this.currentIndex < this.questions.length - 1) {
        this.currentIndex++
      } else {
        this.finishQuiz()
      }
    },
    prevQuestion() {
      if (this.currentIndex > 0) {
        this.currentIndex--
      }
    },
    async finishQuiz() {
      // Get user_id from localStorage
      const user_id = localStorage.getItem('user_id')
      if (!user_id) {
        alert('User not logged in. Please log in to submit your answers.');
        this.loading = false;
        return;
      }
      this.loading = true
      try {
        // Prepare answers array for backend
        const answersPayload = this.questions.map((q, idx) => ({
          test_question_id: q.test_question_id,
          selected: this.answers[idx] !== null && this.answers[idx] !== undefined
            ? `answer_${this.answers[idx] + 1}`
            : null
        }))
        const response = await axiosInstance.post('/test/answer', {
          test_topic_id: this.selectedTopic.test_topic_id,
          user_id,
          answers: answersPayload
        })
        // Use backend response for correct/incorrect counts
        if (response.data && response.data.result) {
          this.correctCount = response.data.result.testAnswers.number_of_correct_answers
          this.incorrectCount = response.data.result.testAnswers.number_of_incorrect_answers
          this.score = this.correctCount
        } else {
          this.correctCount = 0
          this.incorrectCount = this.answers.length
          this.score = 0
        }
        this.quizFinished = true
      } catch (e) {
        this.quizFinished = true
      }
      this.loading = false
    },
    restartQuiz() {
      this.selectedTopic = null
      this.questions = []
      this.answers = []
      this.currentIndex = 0
      this.quizFinished = false
      this.score = 0
      this.correctCount = 0
      this.incorrectCount = 0
    }
  },
  mounted() {
    this.fetchTopics()
  }
}
</script>

<style scoped>
.tests-outer {
  min-height: 40vh;
  background: #f5f7fa;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 60px;
}

.tests-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.10);
  border: 1.5px solid #e3eaf2;
  padding: 48px 40px 24px 40px;
  margin-top: 32px;
  width: 100%;
  max-width: 600px;
  min-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.quiz-title {
  font-weight: 800;
  margin-bottom: 28px;
  color: #0d223a;
  text-align: center;
  letter-spacing: -1px;
}

.question-block {
  width: 100%;
  margin-bottom: 18px;
}

.question-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.question-number {
  font-size: 1.08rem;
  color: #7b8189;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e3eaf2;
  border-radius: 4px;
  margin-bottom: 16px;
  overflow: hidden;
}

.progress-bar-inner {
  height: 100%;
  background: linear-gradient(90deg, #00bcd4 0%, #2196f3 100%);
  border-radius: 4px;
  transition: width 0.3s;
}

.question {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 22px;
  color: #1e293b;
  letter-spacing: -0.5px;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.option-btn {
  padding: 14px 24px;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  background: #f9f9f9;
  cursor: pointer;
  font-size: 1.08rem;
  font-weight: 500;
  transition: background 0.2s, border 0.2s, color 0.2s;
  text-align: left;
  color: #222;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.option-btn.selected,
.option-btn:hover {
  background: #e0f7fa;
  border-color: #00bcd4;
  color: #007c91;
}

.quiz-actions {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 32px;
  gap: 18px;
}

.nav-btn {
  padding: 12px 32px;
  background: linear-gradient(90deg, #00bcd4 0%, #2196f3 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.08rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.08);
}

.nav-btn:disabled {
  background: #b2ebf2;
  color: #7b8189;
  cursor: not-allowed;
  box-shadow: none;
}

.result-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.score {
  font-size: 1.35rem;
  margin-bottom: 28px;
  color: #00bcd4;
  font-weight: 700;
}

.restart-btn {
  padding: 12px 32px;
  background: linear-gradient(90deg, #00bcd4 0%, #2196f3 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.08rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.08);
}

.topics-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  margin-bottom: 24px;
}

.topic-btn {
  padding: 16px 24px;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  background: #f9f9f9;
  cursor: pointer;
  font-size: 1.15rem;
  font-weight: 600;
  transition: background 0.2s, border 0.2s, color 0.2s;
  color: #222;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  text-align: left;
}

.topic-btn:hover {
  background: #e0f7fa;
  border-color: #00bcd4;
  color: #007c91;
}

.topic-quarter {
  display: block;
  font-size: 0.85rem;
  font-weight: 400;
  color: #7b8189;
  margin-top: 4px;
}

.loading-block {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  font-size: 1.2rem;
  color: #00bcd4;
}

@media (max-width: 700px) {
  .tests-card {
    margin-top: 10px;
    max-width: 98vw;
  }

  .quiz-title {
    font-size: 1.2rem;
  }

  .question {
    font-size: 1rem;
  }

  .option-btn {
    font-size: 1rem;
    padding: 10px 10px;
  }

  .nav-btn,
  .restart-btn {
    font-size: 1rem;
    padding: 10px 10px;
  }
}
</style>