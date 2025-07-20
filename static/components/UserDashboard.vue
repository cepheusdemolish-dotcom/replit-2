<template id="user-dashboard">
    <div>
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="bi bi-speedometer2"></i> User Dashboard</h2>
            <div class="input-group" style="max-width: 300px;">
                <input type="text" class="form-control" placeholder="Search quizzes..." v-model="searchQuery" @keyup.enter="search">
                <button class="btn btn-outline-secondary" @click="search">
                    <i class="bi bi-search"></i>
                </button>
            </div>
        </div>

        <!-- Statistics Cards -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card text-center">
                    <div class="card-body">
                        <i class="bi bi-clipboard-check-fill fs-2 text-primary"></i>
                        <h5 class="mt-2">{{ stats.total_attempts || 0 }}</h5>
                        <small class="text-muted">Quiz Attempts</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card text-center">
                    <div class="card-body">
                        <i class="bi bi-percent fs-2 text-success"></i>
                        <h5 class="mt-2">{{ stats.average_score || 0 }}%</h5>
                        <small class="text-muted">Average Score</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card text-center">
                    <div class="card-body">
                        <i class="bi bi-book-fill fs-2 text-info"></i>
                        <h5 class="mt-2">{{ stats.total_subjects_attempted || 0 }}</h5>
                        <small class="text-muted">Subjects Attempted</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card text-center">
                    <div class="card-body">
                        <i class="bi bi-trophy-fill fs-2 text-warning"></i>
                        <h5 class="mt-2">{{ stats.best_score || 0 }}%</h5>
                        <small class="text-muted">Best Score</small>
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="row mb-4">
            <div class="col-md-6 mb-3">
                <div class="card h-100">
                    <div class="card-body text-center">
                        <i class="bi bi-patch-question-fill fs-1 text-primary mb-3"></i>
                        <h5 class="card-title">Take a Quiz</h5>
                        <p class="card-text">Browse available quizzes and test your knowledge.</p>
                        <button class="btn btn-primary" @click="showQuizSelection = true">Browse Quizzes</button>
                    </div>
                </div>
            </div>
            <div class="col-md-6 mb-3">
                <div class="card h-100">
                    <div class="card-body text-center">
                        <i class="bi bi-clock-history fs-1 text-success mb-3"></i>
                        <h5 class="card-title">Quiz History</h5>
                        <p class="card-text">Review your past quiz attempts and scores.</p>
                        <button class="btn btn-success" @click="$emit('switch-view', 'quiz-history')">View History</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Available Quizzes -->
        <div v-if="showQuizSelection">
            <h5>Available Quizzes</h5>
            <div v-if="subjects.length === 0" class="text-center">
                <div class="alert alert-info">No quizzes available at the moment.</div>
            </div>
            <div v-else>
                <div class="accordion" id="quizAccordion">
                    <div v-for="subject in subjects" :key="subject.id" class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" 
                                    :data-bs-target="'#subject' + subject.id">
                                <i class="bi bi-book-fill me-2"></i>
                                {{ subject.name }} 
                                <span class="badge bg-secondary ms-2">{{ subject.chapter_count }} chapters</span>
                            </button>
                        </h2>
                        <div :id="'subject' + subject.id" class="accordion-collapse collapse" data-bs-parent="#quizAccordion">
                            <div class="accordion-body">
                                <div v-if="subjectChapters[subject.id]">
                                    <div v-for="chapter in subjectChapters[subject.id]" :key="chapter.id" class="mb-3">
                                        <h6><i class="bi bi-collection-fill me-2"></i>{{ chapter.name }}</h6>
                                        <div v-if="chapterQuizzes[chapter.id] && chapterQuizzes[chapter.id].length > 0" class="ms-4">
                                            <div v-for="quiz in chapterQuizzes[chapter.id]" :key="quiz.id" class="card mb-2">
                                                <div class="card-body">
                                                    <div class="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <h6 class="mb-1">{{ quiz.title }}</h6>
                                                            <small class="text-muted">
                                                                <i class="bi bi-clock me-1"></i>{{ quiz.time_duration }} minutes
                                                                <i class="bi bi-question-circle ms-2 me-1"></i>{{ quiz.question_count }} questions
                                                            </small>
                                                        </div>
                                                        <button class="btn btn-primary btn-sm" @click="startQuiz(quiz.id)">
                                                            <i class="bi bi-play-fill me-1"></i>Start Quiz
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-else class="ms-4">
                                            <small class="text-muted">No quizzes available for this chapter.</small>
                                        </div>
                                    </div>
                                </div>
                                <div v-else class="text-center">
                                    <button class="btn btn-sm btn-outline-primary" @click="loadChapters(subject.id)">
                                        Load Chapters
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Search Results -->
        <div v-if="searchResults && searchQuery">
            <h5>Search Results for "{{ searchQuery }}"</h5>
            
            <div v-if="searchResults.quizzes.length > 0">
                <div class="row">
                    <div v-for="quiz in searchResults.quizzes" :key="quiz.id" class="col-md-6 mb-3">
                        <div class="card">
                            <div class="card-body">
                                <h6 class="card-title">{{ quiz.title }}</h6>
                                <p class="card-text">
                                    <span class="badge bg-secondary">{{ quiz.subject_name }}</span>
                                    <span class="badge bg-info">{{ quiz.chapter_name }}</span>
                                </p>
                                <small class="text-muted">
                                    <i class="bi bi-clock me-1"></i>{{ quiz.time_duration }} minutes
                                </small>
                                <div class="mt-2">
                                    <button class="btn btn-primary btn-sm" @click="startQuiz(quiz.id)">
                                        <i class="bi bi-play-fill me-1"></i>Start Quiz
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="searchResults.quizzes.length === 0">
                <div class="alert alert-info">No quizzes found for "{{ searchQuery }}"</div>
            </div>
        </div>
    </div>
</template>

<script>
app.component('user-dashboard', {
    template: '#user-dashboard',
    data() {
        return {
            stats: {},
            searchQuery: '',
            searchResults: null,
            subjects: [],
            subjectChapters: {},
            chapterQuizzes: {},
            showQuizSelection: false
        }
    },
    async mounted() {
        await this.loadStats();
        await this.loadSubjects();
    },
    methods: {
        async loadStats() {
            try {
                const response = await axios.get('/api/dashboard/stats', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                });
                this.stats = response.data;
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        },
        async loadSubjects() {
            try {
                const response = await axios.get('/api/subjects', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                });
                this.subjects = response.data;
            } catch (error) {
                console.error('Error loading subjects:', error);
            }
        },
        async loadChapters(subjectId) {
            try {
                const response = await axios.get(`/api/subjects/${subjectId}/chapters`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                });
                this.$set(this.subjectChapters, subjectId, response.data);
                
                // Load quizzes for each chapter
                for (const chapter of response.data) {
                    await this.loadQuizzes(chapter.id);
                }
            } catch (error) {
                console.error('Error loading chapters:', error);
            }
        },
        async loadQuizzes(chapterId) {
            try {
                const response = await axios.get(`/api/chapters/${chapterId}/quizzes`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                });
                this.$set(this.chapterQuizzes, chapterId, response.data);
            } catch (error) {
                console.error('Error loading quizzes:', error);
            }
        },
        async search() {
            if (!this.searchQuery.trim()) {
                this.searchResults = null;
                return;
            }

            try {
                const response = await axios.get(`/api/search?q=${encodeURIComponent(this.searchQuery)}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                });
                this.searchResults = response.data;
            } catch (error) {
                console.error('Error searching:', error);
            }
        },
        startQuiz(quizId) {
            this.$emit('switch-view', 'quiz-attempt', null, null, quizId);
        }
    }
});
</script>
