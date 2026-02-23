<script setup>
import { ref } from 'vue';

// 這支目前是 Vite 預設範例，先留著當最小互動元件參考。
const props = defineProps({
  msg: String,
});
const count = ref(0);
</script>

<template>
  <h1>{{ props.msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
  </div>
</template>

<style scoped></style>
