# Engineer Portfolio Resume System (No Backend)

以 `Vue 3 + Vite + vue-router` 建立的互動式履歷小專案，資料來源完全使用本地 JSON，並以 `localStorage` 模擬 CMS 後台儲存。

## Core Concept

把履歷當成產品，而不是單頁文件。此專案包含：

- 前台作品展示（首頁、專案列表、專案詳情、經歷時間線）
- 動態篩選（關鍵字 + Tag Filter）
- 多版本履歷（Frontend / Medical / Global）
- 語系切換（ZH / EN）
- 主題切換 + 列印 PDF
- 後台 CMS 模擬（登入、編輯、排序、還原）

## Routes

- `/` 首頁
- `/projects` 專案列表（搜尋 + 篩選）
- `/projects/:slug` 專案詳情
- `/timeline` 經歷時間線
- `/admin` 履歷 CMS（無後端）

## Data Layer

- Seed JSON: `src/data/resume.json`
- Mock API: `src/boots/api.js`
- Global store: `src/stores/resumeStore.js`

## Run

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## CMS Demo Login

- PIN: `2026`
