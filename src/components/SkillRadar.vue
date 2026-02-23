<script setup>
import { computed } from 'vue';
import { localizeText } from '../utils/i18n';
import { useResumeStore } from '../stores/resumeStore';

const store = useResumeStore();

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  locale: {
    type: String,
    default: 'zh-TW',
  },
});

// 雷達圖的基礎幾何設定（尺寸、中心點、半徑）。
const size = 300;
const center = size / 2;
const radius = 104;
const rings = [20, 40, 60, 80, 100];

// 最多畫六軸，讓標籤密度剛好可讀。
const radarItems = computed(() => props.items.slice(0, 6));
const total = computed(() => Math.max(radarItems.value.length, 1));
const chartAriaLabel = computed(() => store.ui('skillRadar.ariaLabel'));

function getPoint(score, index, maxScore = 100) {
  // 這段就是把「分數 + 軸索引」轉成 SVG 座標。
  const angle = -Math.PI / 2 + (2 * Math.PI * index) / total.value;
  const normalizedScore = Math.max(0, Math.min(score, maxScore));
  const currentRadius = (normalizedScore / maxScore) * radius;
  const x = center + Math.cos(angle) * currentRadius;
  const y = center + Math.sin(angle) * currentRadius;
  return { x, y };
}

const outerVertices = computed(() =>
  radarItems.value.map((item, index) => getPoint(100, index, 100))
);

const shapeVertices = computed(() =>
  radarItems.value.map((item, index) => getPoint(item.score ?? 0, index, 100))
);

const outerPolygon = computed(() =>
  outerVertices.value.map((point) => `${point.x},${point.y}`).join(' ')
);

const shapePolygon = computed(() =>
  shapeVertices.value.map((point) => `${point.x},${point.y}`).join(' ')
);

const labelPoints = computed(() =>
  // 標籤比外框再往外一點，避免跟點位擠在一起。
  radarItems.value.map((item, index) => {
    const outer = getPoint(114, index, 114);
    return {
      id: item.id,
      x: outer.x,
      y: outer.y,
      text: localizeText(item.label, props.locale),
      score: item.score ?? 0,
    };
  })
);
</script>

<template>
  <!-- 左邊畫圖，右邊圖例，面試時比較好講解。 -->
  <div class="radar-wrap">
    <svg
      :viewBox="`0 0 ${size} ${size}`"
      class="radar-svg"
      role="img"
      :aria-label="chartAriaLabel"
    >
      <circle
        v-for="ring in rings"
        :key="`ring-${ring}`"
        :cx="center"
        :cy="center"
        :r="(ring / 100) * radius"
        class="radar-ring"
      />

      <line
        v-for="(vertex, index) in outerVertices"
        :key="`axis-${index}`"
        :x1="center"
        :y1="center"
        :x2="vertex.x"
        :y2="vertex.y"
        class="radar-axis"
      />

      <polygon :points="outerPolygon" class="radar-grid" />

      <polygon :points="shapePolygon" class="radar-shape" />

      <circle
        v-for="(point, index) in shapeVertices"
        :key="`point-${index}`"
        :cx="point.x"
        :cy="point.y"
        r="4"
        class="radar-dot"
      />

      <text
        v-for="label in labelPoints"
        :key="`label-${label.id}`"
        :x="label.x"
        :y="label.y"
        class="radar-label"
      >
        {{ label.text }}
      </text>
    </svg>

    <div class="radar-legend">
      <div v-for="label in labelPoints" :key="`legend-${label.id}`" class="legend-row">
        <span>{{ label.text }}</span>
        <strong>{{ label.score }}</strong>
      </div>
    </div>
  </div>
</template>

<style scoped>
.radar-wrap {
  display: grid;
  gap: 0.9rem;
  grid-template-columns: minmax(240px, 340px) 1fr;
}

.radar-svg {
  width: 100%;
  max-width: 340px;
}

.radar-ring {
  fill: none;
  stroke: color-mix(in srgb, var(--accent) 34%, var(--border));
  stroke-width: 0.8;
  opacity: 0.58;
}

.radar-axis {
  stroke: color-mix(in srgb, var(--text-soft) 35%, transparent);
  stroke-width: 0.8;
}

.radar-grid {
  fill: color-mix(in srgb, var(--accent) 7%, transparent);
  stroke: color-mix(in srgb, var(--accent) 30%, var(--border));
  stroke-width: 1;
}

.radar-shape {
  fill: color-mix(in srgb, var(--accent) 35%, transparent);
  stroke: var(--accent);
  stroke-width: 1.8;
}

.radar-dot {
  fill: var(--accent);
}

.radar-label {
  fill: var(--text-main);
  font-size: 0.62rem;
  text-anchor: middle;
}

.radar-legend {
  display: grid;
  gap: 0.46rem;
  align-content: start;
}

.legend-row {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  border-bottom: 1px dashed var(--border);
  padding-bottom: 0.34rem;
  color: var(--text-soft);
}

.legend-row strong {
  color: var(--text-main);
}

@media (max-width: 880px) {
  .radar-wrap {
    grid-template-columns: 1fr;
  }

  .radar-svg {
    margin: 0 auto;
  }
}
</style>
