<template>
    <div>
        <div class="card">
            <div class="card-body text-center">
                <h3><i class="bi bi-clock"></i> Quiz Attempt</h3>
                <p class="text-muted">Quiz attempt functionality coming soon!</p>
                <button class="btn btn-primary" @click="$emit('quiz-completed', { score: 0 })">
                    <i class="bi bi-arrow-left"></i> Back to Dashboard
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'QuizAttempt',
    props: ['quizId']
};
</script>