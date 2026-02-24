import seedData from '../data/resume.json';

// 深拷貝資料，避免直接回傳可被外部污染的參考。
function cloneValue(value) {
  // 先深拷貝一份，避免元件直接改到 seed 原始資料。
  return JSON.parse(JSON.stringify(value));
}

// 模擬 API 延遲後回傳履歷資料。
export async function fetchResumeData() {
  // 這裡故意模擬 API 延遲，讓 loading 狀態有存在價值。
  await new Promise((resolve) => {
    window.setTimeout(resolve, 160);
  });

  return cloneValue(seedData);
}
