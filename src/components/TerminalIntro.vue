<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps({
  lines: {
    type: Array,
    default: () => [],
  },
  speed: {
    type: Number,
    default: 26,
  },
});

// 這個陣列會一個字一個字長出來，做終端機打字效果。
const renderedLines = ref([]);
const showCursor = ref(true);

let typeTimer = null;
let cursorTimer = null;

function beginTyping() {
  // 先把非字串資料過濾掉，避免不預期型別。
  const sourceLines = props.lines.filter((line) => typeof line === 'string');
  renderedLines.value = sourceLines.map(() => '');

  let lineIndex = 0;
  let charIndex = 0;

  const tick = () => {
    if (lineIndex >= sourceLines.length) {
      return;
    }

    const source = sourceLines[lineIndex];
    renderedLines.value[lineIndex] = source.slice(0, charIndex + 1);
    charIndex += 1;

    if (charIndex > source.length) {
      // 一行打完先停頓一下，再繼續下一行。
      lineIndex += 1;
      charIndex = 0;
      typeTimer = window.setTimeout(tick, props.speed * 4);
      return;
    }

    typeTimer = window.setTimeout(tick, props.speed);
  };

  tick();
}

onMounted(() => {
  beginTyping();

  // 游標閃爍用 interval，視覺上比較像 terminal。
  cursorTimer = window.setInterval(() => {
    showCursor.value = !showCursor.value;
  }, 520);
});

onBeforeUnmount(() => {
  // 元件移除時要清掉 timer，避免記憶體外漏。
  if (typeTimer) {
    window.clearTimeout(typeTimer);
  }

  if (cursorTimer) {
    window.clearInterval(cursorTimer);
  }
});
</script>

<template>
  <!-- 這塊就是 terminal 視覺殼：上面三顆燈 + 打字區。 -->
  <div class="terminal">
    <div class="terminal__head">
      <span />
      <span />
      <span />
    </div>
    <pre class="terminal__body">
<code
  v-for="(line, index) in renderedLines"
  :key="`terminal-line-${index}`"
>> {{ line }}<span
    v-if="index === renderedLines.length - 1 && showCursor"
    class="terminal__cursor"
  >_</span></code>
    </pre>
  </div>
</template>

<style scoped>
.terminal {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: #0f1d1f;
}

.terminal__head {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  padding: 0.46rem 0.56rem;
  background: #1d3032;
}

.terminal__head span {
  width: 0.62rem;
  height: 0.62rem;
  border-radius: 999px;
  background: #f3b06c;
}

.terminal__head span:nth-child(2) {
  background: #e4df8b;
}

.terminal__head span:nth-child(3) {
  background: #82d7c3;
}

.terminal__body {
  margin: 0;
  padding: 0.8rem 0.9rem;
  color: #daf4e9;
  font-family: 'IBM Plex Sans', monospace;
  font-size: 0.85rem;
  min-height: 7.6rem;
}

.terminal__body code {
  display: block;
  white-space: pre-wrap;
}

.terminal__cursor {
  color: #81dbc4;
}
</style>
