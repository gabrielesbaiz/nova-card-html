<template>
    <div class="nova-card-html-skeleton" aria-hidden="true">
        <div
            v-for="(width, index) in widths"
            :key="index"
            class="nova-card-html-skeleton-line"
            :style="{ width }"
        />
    </div>
</template>

<script setup>
defineProps({
    widths: {
        type: Array,
        default: () => ["70%", "100%", "85%"],
    },
});
</script>
