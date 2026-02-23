<script setup>
import { computed } from 'vue';
import { useResumeStore } from '../stores/resumeStore';

const store = useResumeStore();

const props = defineProps({
  tags: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);

// 先轉成 Set，檢查是否已選會比較快。
const selectedSet = computed(() => new Set(props.modelValue));
const clearLabel = computed(() => store.ui('tagFilter.clear'));

function toggleTag(tag) {
  const next = new Set(props.modelValue);

  if (next.has(tag)) {
    next.delete(tag);
  } else {
    next.add(tag);
  }

  emit('update:modelValue', [...next]);
}

function clearTags() {
  // 一鍵清空所有條件。
  emit('update:modelValue', []);
}
</script>

<template>
  <!-- 第一顆是清空，其餘是可切換的 tag。 -->
  <div class="filters">
    <button class="btn" type="button" @click="clearTags">{{ clearLabel }}</button>

    <button
      v-for="tag in tags"
      :key="tag"
      class="btn"
      type="button"
      :class="{ 'is-active': selectedSet.has(tag) }"
      @click="toggleTag(tag)"
    >
      {{ tag }}
    </button>
  </div>
</template>

<style scoped>
.filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filters .btn {
  padding: 0.42rem 0.72rem;
  font-size: 0.82rem;
}

.filters .btn.is-active {
  border-color: color-mix(in srgb, var(--accent) 50%, var(--border));
  background: color-mix(in srgb, var(--accent) 20%, transparent);
}
</style>
