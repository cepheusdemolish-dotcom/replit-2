<template>
    <div>
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="bi bi-clock-history"></i> Quiz History</h2>
            <button class="btn btn-secondary" @click="$emit('switch-view', 'user-dashboard')">
                <i class="bi bi-arrow-left"></i> Back to Dashboard
            </button>
        </div>
        
        <div class="card">
            <div class="card-body">
                <div v-if="history.length === 0" class="text-center text-muted py-4">
                    No quiz history found. Take some quizzes to see your progress!
                </div>
                <div v-else class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Quiz</th>
                                <th>Subject</th>
                                <th>Score</th>
                                <th>Time Taken</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="attempt in history" :key="attempt.id">
                                <td>{{ attempt.quiz_title }}</td>
                                <td>{{ attempt.subject_name }}</td>
                                <td>
                                    <span class="badge" :class="getScoreBadgeClass(attempt.percentage)">
                                        {{ attempt.percentage }}%
                                    </span>
                                </td>
                                <td>{{ attempt.time_taken }} min</td>
                                <td>{{ formatDate(attempt.attempt_date) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'QuizHistory',
    data() {
        return {
            history: []
        };
    },
    mounted() {
        this.loadHistory();
    },
    methods: {
        async loadHistory() {
            try {
                const response = await axios.get('/api/user/scores');
                this.history = response.data;
            } catch (error) {
                console.error('Failed to load quiz history:', error);
            }
        },
        getScoreBadgeClass(score) {
            if (score >= 90) return 'bg-success';
            if (score >= 70) return 'bg-warning';
            return 'bg-danger';
        },
        formatDate(dateString) {
            return new Date(dateString).toLocaleDateString();
        }
    }
};
</script>