<template id="quiz-manager">
    <div>
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h3><i class="bi bi-patch-question-fill"></i> Quiz Manager</h3>
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item">
                            <a href="#" @click="$emit('switch-view', 'subjects')">Subjects</a>
                        </li>
                        <li class="breadcrumb-item">
                            <a href="#" @click="$emit('switch-view', 'chapters', currentSubjectId)">{{ currentSubject?.name }}</a>
                        </li>
                        <li class="breadcrumb-item active">{{ currentChapter?.name }}</li>
                    </ol>
                </nav>
            </div>
            <button class="btn btn-primary" @click="showCreateForm = true" :disabled="!chapterId">
                <i class="bi bi-plus-lg"></i> Add Quiz
            </button>
        </div>

        <!-- Chapter Selection -->
        <div v-if="!chapterId" class="card mb-4">
            <div class="card-header">
                <h5>Select Chapter</h5>
            </div>
            <div class="card-body">
                <div v-if="allChapters.length === 0" class="text-center">
                    <p>No chapters available. Please create chapters first.</p>
                    <button class="btn btn-primary" @click="$emit('switch-view', 'subjects')">Manage Subjects</button>
                </div>
                <div v-else>
                    <div class="accordion" id="chapterAccordion">
                        <div v-for="subject in subjects" :key="subject.id" class="accordion-item">
                            <h2 class="accordion-header">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" 
                                        :data-bs-target="'#subject' + subject.id">
                                    {{ subject.name }}
                                </button>
                            </h2>
                            <div :id="'subject' + subject.id" class="accordion-collapse collapse" data-bs-parent="#chapterAccordion">
                                <div class="accordion-body">
                                    <div v-if="subjectChapters[subject.id]">
                                        <div v-for="chapter in subjectChapters[subject.id]" :key="chapter.id" class="mb-2">
                                            <button class="btn btn-outline-primary w-100" @click="selectChapter(chapter.id, subject.id)">
                                                {{ chapter.name }}
                                                <span class="badge bg-secondary ms-2">{{ chapter.quiz_count }} quizzes</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div v-else class="text-center">
                                        <button class="btn btn-sm btn-outline-primary" @click="loadChaptersForSubject(subject.id)">
                                            Load Chapters
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Quiz Management -->
        <div v-if="chapterId">
            <!-- Create/Edit Form -->
            <div v-if="showCreateForm || editingQuiz" class="card mb-4">
                <div class="card-header">
                    <h5>{{ editingQuiz ? 'Edit Quiz' : 'Create New Quiz' }}</h5>
                </div>
                <div class="card-body">
                    <div v-if="error" class="alert alert-danger">{{ error }}</div>
                    <form @submit.prevent="saveQuiz">
                        <div class="row">
                            <div class="col-md-8">
                                <div class="mb-3">
                                    <label for="title" class="form-label">Quiz Title</label>
                                    <input type="text" class="form-control" id="title" v-model="form.title" required>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="time_duration" class="form-label">Duration (minutes)</label>
                                    <input type="number" class="form-control" id="time_duration" v-model="form.time_duration" min="1" required>
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="remarks" class="form-label">Remarks</label>
                            <textarea class="form-control" id="remarks" v-model="form.remarks" rows="3"></textarea>
                        </div>
                        <div class="d-flex gap-2">
                            <button type="submit" class="btn btn-success" :disabled="loading">
                                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                                {{ loading ? 'Saving...' : (editingQuiz ? 'Update' : 'Create') }}
                            </button>
                            <button type="button" class="btn btn-secondary" @click="cancelForm">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Quizzes List -->
            <div class="card">
                <div class="card-header">
                    <h5>Quizzes in {{ currentChapter?.name }} ({{ quizzes.length }})</h5>
                </div>
                <div class="card-body">
                    <div v-if="quizzes.length === 0" class="text-center">
                        <i class="bi bi-inbox fs-1 text-muted"></i>
                        <p class="mt-3">No quizzes created yet.</p>
                    </div>
                    <div v-else>
                        <div class="row">
                            <div v-for="quiz in quizzes" :key="quiz.id" class="col-md-6 mb-3">
                                <div class="card">
                                    <div class="card-body">
                                        <h6 class="card-title">{{ quiz.title }}</h6>
                                        <p class="card-text">
                                            <small class="text-muted">
                                                <i class="bi bi-clock me-1"></i>{{ quiz.time_duration }} minutes
                                                <i class="bi bi-question-circle ms-2 me-1"></i>{{ quiz.question_count }} questions
                                            </small>
                                        </p>
                                        <p class="card-text">{{ quiz.remarks || 'No remarks' }}</p>
                                        <small class="text-muted">Created: {{ formatDate(quiz.created_at) }}</small>
                                        <div class="mt-2">
                                            <div class="btn-group btn-group-sm w-100">
                                                <button class="btn btn-outline-primary" @click="editQuiz(quiz)">
                                                    <i class="bi bi-pencil"></i> Edit
                                                </button>
                                                <button class="btn btn-outline-info" @click="manageQuestions(quiz.id)">
                                                    <i class="bi bi-question-circle"></i> Questions
                                                </button>
                                                <button class="btn btn-outline-danger" @click="deleteQuiz(quiz.id)">
                                                    <i class="bi bi-trash"></i> Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Question Management Modal -->
            <div v-if="managingQuiz" class="modal d-block" style="background-color: rgba(0,0,0,0.5);">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Manage Questions - {{ managingQuiz.title }}</h5>
                            <button type="button" class="btn-close" @click="managingQuiz = null"></button>
                        </div>
                        <div class="modal-body">
                            <!-- Add Question Form -->
                            <div class="card mb-3">
                                <div class="card-header">
                                    <h6>{{ editingQuestion ? 'Edit Question' : 'Add New Question' }}</h6>
                                </div>
                                <div class="card-body">
                                    <div v-if="questionError" class="alert alert-danger">{{ questionError }}</div>
                                    <form @submit.prevent="saveQuestion">
                                        <div class="mb-3">
                                            <label class="form-label">Question Statement</label>
                                            <textarea class="form-control" v-model="questionForm.question_statement" rows="3" required></textarea>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6">
                                                <div class="mb-3">
                                                    <label class="form-label">Option 1</label>
                                                    <input type="text" class="form-control" v-model="questionForm.option1" required>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="mb-3">
                                                    <label class="form-label">Option 2</label>
                                                    <input type="text" class="form-control" v-model="questionForm.option2" required>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6">
                                                <div class="mb-3">
                                                    <label class="form-label">Option 3</label>
                                                    <input type="text" class="form-control" v-model="questionForm.option3" required>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="mb-3">
                                                    <label class="form-label">Option 4</label>
                                                    <input type="text" class="form-control" v-model="questionForm.option4" required>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Correct Option</label>
                                            <select class="form-control" v-model="questionForm.correct_option" required>
                                                <option value="">Select correct option</option>
                                                <option value="1">Option 1</option>
                                                <option value="2">Option 2</option>
                                                <option value="3">Option 3</option>
                                                <option value="4">Option 4</option>
                                            </select>
                                        </div>
                                        <div class="d-flex gap-2">
                                            <button type="submit" class="btn btn-success btn-sm" :disabled="questionLoading">
                                                {{ editingQuestion ? 'Update' : 'Add Question' }}
                                            </button>
                                            <button v-if="editingQuestion" type="button" class="btn btn-secondary btn-sm" @click="cancelQuestionForm">Cancel</button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            <!-- Questions List -->
                            <div class="card">
                                <div class="card-header">
                                    <h6>Questions ({{ questions.length }})</h6>
                                </div>
                                <div class="card-body" style="max-height: 400px; overflow-y: auto;">
                                    <div v-if="questions.length === 0" class="text-center">
                                        <p>No questions added yet.</p>
                                    </div>
                                    <div v-else>
                                        <div v-for="(question, index) in questions" :key="question.id" class="card mb-2">
                                            <div class="card-body p-3">
                                                <h6>Question {{ index + 1 }}</h6>
                                                <p>{{ question.question_statement }}</p>
                                                <div class="row">
                                                    <div class="col-md-6">
                                                        <small :class="question.correct_option === 1 ? 'text-success fw-bold' : ''">
                                                            1. {{ question.option1 }}
                                                        </small>
                                                    </div>
                                                    <div class="col-md-6">
                                                        <small :class="question.correct_option === 2 ? 'text-success fw-bold' : ''">
                                                            2. {{ question.option2 }}
                                                        </small>
                                                    </div>
                                                    <div class="col-md-6">
                                                        <small :class="question.correct_option === 3 ? 'text-success fw-bold' : ''">
                                                            3. {{ question.option3 }}
                                                        </small>
                                                    </div>
                                                    <div class="col-md-6">
                                                        <small :class="question.correct_option === 4 ? 'text-success fw-bold' : ''">
                                                            4. {{ question.option4 }}
                                                        </small>
                                                    </div>
                                                </div>
                                                <div class="mt-2">
                                                    <div class="btn-group btn-group-sm">
                                                        <button class="btn btn-outline-primary" @click="editQuestion(question)">
                                                            <i class="bi bi-pencil"></i>
                                                        </button>
                                                        <button class="btn btn-outline-danger" @click="deleteQuestion(question.id)">
                                                            <i class="bi bi-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
app.component('quiz-manager', {
    template: '#quiz-manager',
    props: ['chapterId'],
    data() {
        return {
            subjects: [],
            subjectChapters: {},
            allChapters: [],
            quizzes: [],
            questions: [],
            currentSubject: null,
            currentChapter: null,
            currentSubjectId: null,
            showCreateForm: false,
            editingQuiz: null,
            managingQuiz: null,
            editingQuestion: null,
            form: {
                title: '',
                time_duration: '',
                remarks: ''
            },
            questionForm: {
                question_statement: '',
                option1: '',
                option2: '',
                option3: '',
                option4: '',
                correct_option: ''
            },
            loading: false,
            questionLoading: false,
            error: '',
            questionError: ''
        }
    },
    async mounted() {
        await this.loadSubjects();
        if (this.chapterId) {
            await this.loadQuizzes();
        }
    },
    watch: {
        chapterId: async function(newVal) {
            if (newVal) {
                await this.loadQuizzes();
            }
        }
    },
    methods: {
        async loadSubjects() {
            try {
                const response = await axios.get('/api/subjects', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                });
                this.subjects = response.data;
                
                // Load all chapters to find current chapter info
                for (const subject of this.subjects) {
                    const chaptersResponse = await axios.get(`/api/subjects/${subject.id}/chapters`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                    });
                    this.allChapters.push(...chaptersResponse.data.map(chapter => ({
                        ...chapter,
                        subject_name: subject.name,
                        subject_id: subject.id
                    })));
                }
                
                if (this.chapterId) {
                    this.currentChapter = this.allChapters.find(c => c.id === parseInt(this.chapterId));
                    if (this.currentChapter) {
                        this.currentSubject = this.subjects.find(s => s.id === this.currentChapter.subject_id);
                        this.currentSubjectId = this.currentChapter.subject_id;
                    }
                }
            } catch (error) {
                console.error('Error loading subjects:', error);
            }
        },
        async loadChaptersForSubject(subjectId) {
            try {
                const response = await axios.get(`/api/subjects/${subjectId}/chapters`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                });
                this.$set(this.subjectChapters, subjectId, response.data);
            } catch (error) {
                console.error('Error loading chapters:', error);
            }
        },
        async loadQuizzes() {
            if (!this.chapterId) return;
            
            try {
                const response = await axios.get(`/api/chapters/${this.chapterId}/quizzes`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                });
                this.quizzes = response.data;
            } catch (error) {
                console.error('Error loading quizzes:', error);
            }
        },
        async loadQuestions(quizId) {
            try {
                const response = await axios.get(`/api/quizzes/${quizId}/questions`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                });
                this.questions = response.data;
            } catch (error) {
                console.error('Error loading questions:', error);
            }
        },
        selectChapter(chapterId, subjectId) {
            this.$emit('switch-view', 'quiz-manager', null, chapterId);
        },
        async saveQuiz() {
            this.loading = true;
            this.error = '';
            
            try {
                let response;
                const payload = { ...this.form, chapter_id: parseInt(this.chapterId), time_duration: parseInt(this.form.time_duration) };
                
                if (this.editingQuiz) {
                    response = await axios.put(`/api/quizzes/${this.editingQuiz.id}`, payload, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                    });
                } else {
                    response = await axios.post('/api/quizzes', payload, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                    });
                }
                
                await this.loadQuizzes();
                this.cancelForm();
            } catch (error) {
                this.error = error.response?.data?.error || 'Error saving quiz';
            } finally {
                this.loading = false;
            }
        },
        editQuiz(quiz) {
            this.editingQuiz = quiz;
            this.form.title = quiz.title;
            this.form.time_duration = quiz.time_duration;
            this.form.remarks = quiz.remarks || '';
            this.showCreateForm = false;
        },
        async deleteQuiz(quizId) {
            if (!confirm('Are you sure you want to delete this quiz? This will also delete all questions.')) {
                return;
            }
            
            try {
                await axios.delete(`/api/quizzes/${quizId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                });
                await this.loadQuizzes();
            } catch (error) {
                alert('Error deleting quiz: ' + (error.response?.data?.error || error.message));
            }
        },
        async manageQuestions(quizId) {
            this.managingQuiz = this.quizzes.find(q => q.id === quizId);
            await this.loadQuestions(quizId);
            this.resetQuestionForm();
        },
        async saveQuestion() {
            this.questionLoading = true;
            this.questionError = '';
            
            try {
                const payload = {
                    ...this.questionForm,
                    quiz_id: this.managingQuiz.id,
                    correct_option: parseInt(this.questionForm.correct_option)
                };
                
                if (this.editingQuestion) {
                    await axios.put(`/api/questions/${this.editingQuestion.id}`, payload, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                    });
                } else {
                    await axios.post('/api/questions', payload, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                    });
                }
                
                await this.loadQuestions(this.managingQuiz.id);
                await this.loadQuizzes(); // Refresh quiz list to update question counts
                this.resetQuestionForm();
            } catch (error) {
                this.questionError = error.response?.data?.error || 'Error saving question';
            } finally {
                this.questionLoading = false;
            }
        },
        editQuestion(question) {
            this.editingQuestion = question;
            this.questionForm.question_statement = question.question_statement;
            this.questionForm.option1 = question.option1;
            this.questionForm.option2 = question.option2;
            this.questionForm.option3 = question.option3;
            this.questionForm.option4 = question.option4;
            this.questionForm.correct_option = question.correct_option;
        },
        async deleteQuestion(questionId) {
            if (!confirm('Are you sure you want to delete this question?')) {
                return;
            }
            
            try {
                await axios.delete(`/api/questions/${questionId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                });
                await this.loadQuestions(this.managingQuiz.id);
                await this.loadQuizzes(); // Refresh quiz list to update question counts
            } catch (error) {
                alert('Error deleting question: ' + (error.response?.data?.error || error.message));
            }
        },
        cancelForm() {
            this.showCreateForm = false;
            this.editingQuiz = null;
            this.form.title = '';
            this.form.time_duration = '';
            this.form.remarks = '';
            this.error = '';
        },
        cancelQuestionForm() {
            this.editingQuestion = null;
            this.resetQuestionForm();
        },
        resetQuestionForm() {
            this.editingQuestion = null;
            this.questionForm.question_statement = '';
            this.questionForm.option1 = '';
            this.questionForm.option2 = '';
            this.questionForm.option3 = '';
            this.questionForm.option4 = '';
            this.questionForm.correct_option = '';
            this.questionError = '';
        },
        formatDate(dateString) {
            return new Date(dateString).toLocaleDateString();
        }
    }
});
</script>
