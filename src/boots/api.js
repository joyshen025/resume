import seedData from '../data/resume.json';

function cloneValue(value) {
  // 先深拷貝一份，避免元件直接改到 seed 原始資料。
  return JSON.parse(JSON.stringify(value));
}

export async function fetchResumeData() {
  // 這裡故意模擬 API 延遲，讓 loading 狀態有存在價值。
  await new Promise((resolve) => {
    window.setTimeout(resolve, 160);
  });

  return cloneValue(seedData);
}
