<template>
    <div>
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="bi bi-clipboard-check"></i> Quiz Manager</h2>
            <div>
                <button class="btn btn-secondary me-2" @click="$emit('switch-view', 'chapters')">
                    <i class="bi bi-arrow-left"></i> Back to Chapters
                </button>
                <button class="btn btn-primary" @click="showCreateModal = true">
                    <i class="bi bi-plus"></i> Create Quiz
                </button>
            </div>
        </div>
        
        <div class="card">
            <div class="card-body">
                <div v-if="quizzes.length === 0" class="text-center text-muted py-4">
                    No quizzes found. Create your first quiz!
                </div>
                <div v-else class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Questions</th>
                                <th>Time Limit</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="quiz in quizzes" :key="quiz.id">
                                <td>{{ quiz.title }}</td>
                                <td>{{ quiz.description }}</td>
                                <td>{{ quiz.question_count || 0 }}</td>
                                <td>{{ quiz.time_limit }} min</td>
                                <td>{{ formatDate(quiz.created_at) }}</td>
                                <td>
                                    <button class="btn btn-sm btn-primary me-2" @click="manageQuestions(quiz.id)">
                                        <i class="bi bi-question-circle"></i> Questions
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" @click="deleteQuiz(quiz.id)">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Create Quiz Modal -->
        <div v-if="showCreateModal" class="modal d-block" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Create New Quiz</h5>
                        <button type="button" class="btn-close" @click="showCreateModal = false"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="createQuiz">
                            <div class="mb-3">
                                <label for="title" class="form-label">Quiz Title</label>
                                <input type="text" class="form-control" v-model="newQuiz.title" required>
                            </div>
                            <div class="mb-3">
                                <label for="description" class="form-label">Description</label>
                                <textarea class="form-control" v-model="newQuiz.description" rows="3"></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="time_limit" class="form-label">Time Limit (minutes)</label>
                                <input type="number" class="form-control" v-model.number="newQuiz.time_limit" min="1" required>
                            </div>
                            <div v-if="error" class="alert alert-danger">{{ error }}</div>
                            <button type="submit" class="btn btn-primary" :disabled="loading">
                                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                                Create Quiz
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'QuizManager',
    props: ['chapterId'],
    data() {
        return {
            quizzes: [],
            showCreateModal: false,
            newQuiz: {
                title: '',
                description: '',
                time_limit: 30
            },
            loading: false,
            error: ''
        };
    },
    mounted() {
        this.loadQuizzes();
    },
    methods: {
        async loadQuizzes() {
            try {
                const response = await axios.get(`/api/chapters/${this.chapterId}/quizzes`);
                this.quizzes = response.data;
            } catch (error) {
                console.error('Failed to load quizzes:', error);
            }
        },
        async createQuiz() {
            this.loading = true;
            this.error = '';
            
            try {
                await axios.post(`/api/admin/chapters/${this.chapterId}/quizzes`, this.newQuiz);
                this.showCreateModal = false;
                this.newQuiz = { title: '', description: '', time_limit: 30 };
                this.loadQuizzes();
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to create quiz.';
            } finally {
                this.loading = false;
            }
        },
        async deleteQuiz(quizId) {
            if (confirm('Are you sure you want to delete this quiz?')) {
                try {
                    await axios.delete(`/api/admin/quizzes/${quizId}`);
                    this.loadQuizzes();
                } catch (error) {
                    alert('Failed to delete quiz.');
                }
            }
        },
        manageQuestions(quizId) {
            // For now, just show an alert - we can implement this later
            alert('Question management coming soon!');
        },
        formatDate(dateString) {
            return new Date(dateString).toLocaleDateString();
        }
    }
};
</script>