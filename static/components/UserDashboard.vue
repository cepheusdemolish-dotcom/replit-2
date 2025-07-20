<template>
    <div>
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="bi bi-person-circle"></i> User Dashboard</h2>
        </div>
        
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="card bg-primary text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">Quizzes Taken</h6>
                                <h3>{{ stats.quizzes_taken }}</h3>
                            </div>
                            <i class="bi bi-clipboard-check fs-1"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">Average Score</h6>
                                <h3>{{ stats.average_score }}%</h3>
                            </div>
                            <i class="bi bi-trophy fs-1"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card bg-info text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">Best Score</h6>
                                <h3>{{ stats.best_score }}%</h3>
                            </div>
                            <i class="bi bi-star fs-1"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="bi bi-book"></i> Available Subjects</h5>
                    </div>
                    <div class="card-body">
                        <div v-if="subjects.length === 0" class="text-muted">No subjects available yet.</div>
                        <div v-else class="row">
                            <div v-for="subject in subjects" :key="subject.id" class="col-md-6 mb-3">
                                <div class="card h-100">
                                    <div class="card-body">
                                        <h6 class="card-title">{{ subject.name }}</h6>
                                        <p class="card-text">{{ subject.description }}</p>
                                        <button class="btn btn-primary btn-sm" @click="viewSubjectQuizzes(subject.id)">
                                            View Quizzes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="bi bi-clock-history"></i> Recent Scores</h5>
                    </div>
                    <div class="card-body">
                        <div v-if="recentScores.length === 0" class="text-muted">No quiz attempts yet.</div>
                        <div v-else>
                            <div v-for="score in recentScores" :key="score.id" class="mb-3">
                                <div class="d-flex justify-content-between">
                                    <small class="text-muted">{{ score.quiz_name }}</small>
                                    <span class="badge bg-primary">{{ score.score }}%</span>
                                </div>
                                <small class="text-muted">{{ score.date }}</small>
                            </div>
                        </div>
                        <button class="btn btn-outline-primary btn-sm w-100 mt-2" @click="$emit('switch-view', 'quiz-history')">
                            View All History
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'UserDashboard',
    data() {
        return {
            stats: {
                quizzes_taken: 0,
                average_score: 0,
                best_score: 0
            },
            subjects: [],
            recentScores: []
        };
    },
    mounted() {
        this.loadDashboardData();
    },
    methods: {
        async loadDashboardData() {
            try {
                const [statsResponse, subjectsResponse, scoresResponse] = await Promise.all([
                    axios.get('/api/user/stats'),
                    axios.get('/api/subjects'),
                    axios.get('/api/user/recent-scores')
                ]);
                
                this.stats = statsResponse.data;
                this.subjects = subjectsResponse.data;
                this.recentScores = scoresResponse.data;
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            }
        },
        viewSubjectQuizzes(subjectId) {
            this.$emit('switch-view', 'chapters', { subjectId });
        }
    }
};
</script>