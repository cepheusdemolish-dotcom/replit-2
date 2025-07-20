<template id="quiz-attempt">
    <div>
        <div v-if="!quiz" class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3">Loading quiz...</p>
        </div>

        <div v-else-if="!quizStarted" class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        <h4><i class="bi bi-patch-question-fill"></i> {{ quiz.title }}</h4>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>Subject:</strong> {{ subjectName }}</p>
                                <p><strong>Chapter:</strong> {{ chapterName }}</p>
                                <p><strong>Duration:</strong> {{ quiz.time_duration }} minutes</p>
                                <p><strong>Questions:</strong> {{ questions.length }}</p>
                            </div>
                            <div class="col-md-6">
                                <div class="alert alert-info">
                                    <h6><i class="bi bi-info-circle"></i> Instructions:</h6>
                                    <ul class="mb-0">
                                        <li>Answer all questions to the best of your ability</li>
                                        <li>You have {{ quiz.time_duration }} minutes to complete</li>
                                        <li>Once started, the timer cannot be paused</li>
                                        <li>Click "Submit Quiz" when you're done</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div v-if="quiz.remarks" class="alert alert-secondary">
                            <strong>Remarks:</strong> {{ quiz.remarks }}
                        </div>
                        <div class="text-center mt-4">
                            <button class="btn btn-primary btn-lg" @click="startQuiz" :disabled="questions.length === 0">
                                <i class="bi bi-play-fill me-2"></i>Start Quiz
                            </button>
                            <div v-if="questions.length === 0" class="alert alert-warning mt-3">
                                This quiz has no questions yet.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else-if="!quizSubmitted">
            <!-- Quiz Interface -->
            <div class="row">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5>{{ quiz.title }}</h5>
                            <div class="timer-display">
                                <i class="bi bi-stopwatch"></i>
                                <span :class="timeRemaining < 300 ? 'text-danger fw-bold' : ''">
                                    {{ formatTime(timeRemaining) }}
                                </span>
                            </div>
                        </div>
                        <div class="card-body">
                            <div v-if="currentQuestion" class="question-container">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h6>Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}</h6>
                                    <div class="progress" style="width: 200px;">
                                        <div class="progress-bar" :style="{width: ((currentQuestionIndex + 1) / questions.length * 100) + '%'}"></div>
                                    </div>
                                </div>
                                
                                <div class="question-statement mb-4">
                                    <p class="fs-5">{{ currentQuestion.question_statement }}</p>
                                </div>

                                <div class="options">
                                    <div v-for="(option, index) in getOptions(currentQuestion)" :key="index" class="option-item mb-2">
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" 
                                                   :name="'question_' + currentQuestion.id"
                                                   :id="'option_' + currentQuestion.id + '_' + (index + 1)"
                                                   :value="index + 1"
                                                   v-model="answers[currentQuestion.id]">
                                            <label class="form-check-label w-100" 
                                                   :for="'option_' + currentQuestion.id + '_' + (index + 1)">
                                                <div class="option-content p-3 border rounded">
                                                    <strong>{{ String.fromCharCode(65 + index) }}.</strong> {{ option }}
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div class="navigation-buttons mt-4 d-flex justify-content-between">
                                    <button class="btn btn-secondary" @click="previousQuestion" :disabled="currentQuestionIndex === 0">
                                        <i class="bi bi-arrow-left"></i> Previous
                                    </button>
                                    <button v-if="currentQuestionIndex < questions.length - 1" class="btn btn-primary" @click="nextQuestion">
                                        Next <i class="bi bi-arrow-right"></i>
                                    </button>
                                    <button v-else class="btn btn-success" @click="showSubmitConfirmation = true">
                                        <i class="bi bi-check-lg"></i> Finish Quiz
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card sticky-top">
                        <div class="card-header">
                            <h6><i class="bi bi-grid-3x3-gap"></i> Question Navigator</h6>
                        </div>
                        <div class="card-body">
                            <div class="question-grid">
                                <button v-for="(question, index) in questions" :key="question.id"
                                        class="btn btn-sm m-1"
                                        :class="getQuestionButtonClass(index)"
                                        @click="goToQuestion(index)">
                                    {{ index + 1 }}
                                </button>
                            </div>
                            <div class="mt-3">
                                <div class="d-flex align-items-center mb-2">
                                    <div class="btn btn-sm btn-primary me-2" style="width: 20px; height: 20px;"></div>
                                    <small>Current</small>
                                </div>
                                <div class="d-flex align-items-center mb-2">
                                    <div class="btn btn-sm btn-success me-2" style="width: 20px; height: 20px;"></div>
                                    <small>Answered</small>
                                </div>
                                <div class="d-flex align-items-center">
                                    <div class="btn btn-sm btn-outline-secondary me-2" style="width: 20px; height: 20px;"></div>
                                    <small>Unanswered</small>
                                </div>
                            </div>
                            <hr>
                            <div class="quiz-summary">
                                <p><strong>Answered:</strong> {{ answeredCount }} / {{ questions.length }}</p>
                                <button class="btn btn-warning btn-sm w-100" @click="showSubmitConfirmation = true">
                                    <i class="bi bi-send"></i> Submit Quiz
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Submit Confirmation Modal -->
            <div v-if="showSubmitConfirmation" class="modal d-block" style="background-color: rgba(0,0,0,0.5);">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Submit Quiz</h5>
                            <button type="button" class="btn-close" @click="showSubmitConfirmation = false"></button>
                        </div>
                        <div class="modal-body">
                            <p>Are you sure you want to submit your quiz?</p>
                            <div class="alert alert-info">
                                <strong>Summary:</strong><br>
                                Answered: {{ answeredCount }} out of {{ questions.length }} questions<br>
                                Time remaining: {{ formatTime(timeRemaining) }}
                            </div>
                            <p class="text-warning">
                                <i class="bi bi-exclamation-triangle"></i>
                                Once submitted, you cannot make any changes.
                            </p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" @click="showSubmitConfirmation = false">Cancel</button>
                            <button type="button" class="btn btn-success" @click="submitQuiz" :disabled="submitting">
                                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                                {{ submitting ? 'Submitting...' : 'Submit Quiz' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Quiz Results -->
        <div v-else-if="quizSubmitted && result" class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header text-center">
                        <h4><i class="bi bi-check-circle-fill text-success"></i> Quiz Completed!</h4>
                    </div>
                    <div class="card-body text-center">
                        <div class="row">
                            <div class="col-md-3">
                                <div class="metric-card">
                                    <div class="metric-value">{{ result.total_scored }}</div>
                                    <div class="metric-label">Correct Answers</div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="metric-card">
                                    <div class="metric-value">{{ result.total_questions }}</div>
                                    <div class="metric-label">Total Questions</div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="metric-card">
                                    <div class="metric-value text-primary">{{ Math.round(result.percentage) }}%</div>
                                    <div class="metric-label">Score</div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="metric-card">
                                    <div class="metric-value">{{ formatTime(result.time_taken) }}</div>
                                    <div class="metric-label">Time Taken</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-4">
                            <div class="progress mb-3" style="height: 30px;">
                                <div class="progress-bar" :class="getScoreClass(result.percentage)" 
                                     :style="{width: result.percentage + '%'}">
                                    {{ Math.round(result.percentage) }}%
                                </div>
                            </div>
                            <p class="lead">{{ getScoreMessage(result.percentage) }}</p>
                        </div>

                        <div class="mt-4">
                            <button class="btn btn-primary me-3" @click="$emit('quiz-completed')">
                                <i class="bi bi-house"></i> Back to Dashboard
                            </button>
                            <button class="btn btn-outline-secondary" @click="$emit('quiz-completed', 'quiz-history')">
                                <i class="bi bi-clock-history"></i> View History
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
app.component('quiz-attempt', {
    template: '#quiz-attempt',
    props: ['quizId'],
    data() {
        return {
            quiz: null,
            questions: [],
            answers: {},
            currentQuestionIndex: 0,
            quizStarted: false,
            quizSubmitted: false,
            timeRemaining: 0,
            timer: null,
            startTime: null,
            showSubmitConfirmation: false,
            submitting: false,
            result: null,
            subjectName: '',
            chapterName: ''
        }
    },
    computed: {
        currentQuestion() {
            return this.questions[this.currentQuestionIndex];
        },
        answeredCount() {
            return Object.keys(this.answers).filter(key => this.answers[key]).length;
        }
    },
    async mounted() {
        if (this.quizId) {
            await this.loadQuiz();
        }
    },
    beforeUnmount() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    },
    methods: {
        async loadQuiz() {
            try {
                // Load quiz details - we need to find it through subjects/chapters
                const subjectsResponse = await axios.get('/api/subjects', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                });
                
                let foundQuiz = null;
                let foundSubject = null;
                let foundChapter = null;

                for (const subject of subjectsResponse.data) {
                    const chaptersResponse = await axios.get(`/api/subjects/${subject.id}/chapters`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                    });
                    
                    for (const chapter of chaptersResponse.data) {
                        const quizzesResponse = await axios.get(`/api/chapters/${chapter.id}/quizzes`, {
                            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                        });
                        
                        foundQuiz = quizzesResponse.data.find(q => q.id === parseInt(this.quizId));
                        if (foundQuiz) {
                            foundSubject = subject;
                            foundChapter = chapter;
                            break;
                        }
                    }
                    if (foundQuiz) break;
                }

                if (!foundQuiz) {
                    throw new Error('Quiz not found');
                }

                this.quiz = foundQuiz;
                this.subjectName = foundSubject.name;
                this.chapterName = foundChapter.name;
                this.timeRemaining = foundQuiz.time_duration * 60; // Convert to seconds

                // Load questions
                const questionsResponse = await axios.get(`/api/quizzes/${this.quizId}/questions`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                });
                this.questions = questionsResponse.data;

                // Initialize answers object
                this.questions.forEach(question => {
                    this.$set(this.answers, question.id, null);
                });

            } catch (error) {
                console.error('Error loading quiz:', error);
                alert('Error loading quiz. Please try again.');
                this.$emit('quiz-completed');
            }
        },
        startQuiz() {
            this.quizStarted = true;
            this.startTime = Date.now();
            this.startTimer();
        },
        startTimer() {
            this.timer = setInterval(() => {
                this.timeRemaining--;
                if (this.timeRemaining <= 0) {
                    this.timeUp();
                }
            }, 1000);
        },
        timeUp() {
            clearInterval(this.timer);
            alert('Time is up! Your quiz will be submitted automatically.');
            this.submitQuiz();
        },
        nextQuestion() {
            if (this.currentQuestionIndex < this.questions.length - 1) {
                this.currentQuestionIndex++;
            }
        },
        previousQuestion() {
            if (this.currentQuestionIndex > 0) {
                this.currentQuestionIndex--;
            }
        },
        goToQuestion(index) {
            this.currentQuestionIndex = index;
        },
        getOptions(question) {
            return [question.option1, question.option2, question.option3, question.option4];
        },
        getQuestionButtonClass(index) {
            if (index === this.currentQuestionIndex) {
                return 'btn-primary';
            } else if (this.answers[this.questions[index].id]) {
                return 'btn-success';
            } else {
                return 'btn-outline-secondary';
            }
        },
        async submitQuiz() {
            this.submitting = true;
            this.showSubmitConfirmation = false;
            
            if (this.timer) {
                clearInterval(this.timer);
            }

            try {
                const timeTaken = Math.floor((Date.now() - this.startTime) / 1000);
                
                const response = await axios.post(`/api/quizzes/${this.quizId}/attempt`, {
                    answers: this.answers,
                    time_taken: timeTaken
                }, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                });

                this.result = response.data.score;
                this.quizSubmitted = true;
            } catch (error) {
                console.error('Error submitting quiz:', error);
                alert('Error submitting quiz: ' + (error.response?.data?.error || error.message));
            } finally {
                this.submitting = false;
            }
        },
        formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        },
        getScoreClass(percentage) {
            if (percentage >= 90) return 'bg-success';
            if (percentage >= 70) return 'bg-primary';
            if (percentage >= 50) return 'bg-warning';
            return 'bg-danger';
        },
        getScoreMessage(percentage) {
            if (percentage >= 90) return 'Excellent work! Outstanding performance!';
            if (percentage >= 70) return 'Great job! Well done!';
            if (percentage >= 50) return 'Good effort! Keep practicing!';
            return 'Keep studying and try again!';
        }
    }
});
</script>
