# Resume API 規格（依 `src/data/resume.json` 反推）

## 1) 資料來源與現況
- 目前資料來源是 `src/data/resume.json`，由 `src/boots/api.js` 的 `fetchResumeData()` 回傳整包資料（模擬 API）。
- 後台編輯（`/admin`）是直接改 `store.state.data`，再寫入 localStorage（`resume.product.data.v1`）。
- 建議後端第一版先提供 `GET /api/resume`，格式與目前 JSON 相容。

## 2) 主要 Endpoint（建議）

### 2.1 讀取
- `GET /api/resume`
  - 說明：回傳完整履歷資料（與 `resume.json` 同結構）。
  - 回應：`ResumePayload`

### 2.2 後台登入（對應現有 Admin）
- `POST /api/admin/login`
  - Request: `{ "pin": "2026" }`
  - Response: `{ "token": "..." }`
  - 對應目前前端欄位：`security.loginPin`

### 2.3 後台編輯（可分階段做）
- `PUT /api/meta`
- `POST /api/skills`
- `DELETE /api/skills/{name}`
- `POST /api/projects`
- `PATCH /api/projects/{slug}`
- `DELETE /api/projects/{slug}`
- `POST /api/projects/{slug}/tech`
- `DELETE /api/projects/{slug}/tech/{techName}`
- `POST /api/experiences`
- `PATCH /api/experiences/{id}`
- `DELETE /api/experiences/{id}`

## 3) `ResumePayload` 結構

### 3.1 頂層物件對照
| 欄位 | 型別 | 中文名稱 | 用途/使用位置 |
|---|---|---|---|
| `meta` | `Meta` | 個人基本資料 | 首頁、Header、語系初始化、Admin 編輯 |
| `security` | `Security` | 後台登入設定 | Admin PIN 登入 |
| `resumeVersions` | `ResumeVersion[]` | 履歷版本清單 | store 版本合法性檢查、Admin 新增專案預設版本 |
| `sectionCatalog` | `SectionCatalogItem[]` | 首頁區塊目錄 | 目前未使用（僅 `sectionOrder` 有用） |
| `sectionOrder` | `string[]` | 首頁區塊排序 | `HomePage` 控制區塊顯示順序 |
| `skills` | `Skill[]` | 技能清單 | 首頁 skills cloud、Admin 編輯 |
| `experiences` | `Experience[]` | 經歷清單 | 首頁預覽、Timeline、Admin 編輯 |
| `projects` | `Project[]` | 專案清單 | 首頁精選、Projects 列表、Detail、Admin 編輯 |
| `ui` | `UiDictionary` | 多語系 UI 字典 | 全站文案（`store.ui()`） |

### 3.2 共用型別
`LocaleText`（多語文字）
```json
{
  "zh-TW": "中文",
  "en-US": "English"
}
```

`LocaleText[]` 常用在 `highlights`、`contributions` 等多行項目。

### 3.3 `meta` 欄位
| 欄位 | 型別 | 中文名稱 | 用在哪裡 |
|---|---|---|---|
| `ownerName` | `string` | 姓名 | Header 品牌名、首頁 Hero、Admin 可編輯 |
| `location` | `string` | 地點 | 首頁 Hero |
| `email` | `string` | Email | 首頁聯絡按鈕（`mailto:`） |
| `github` | `string` | GitHub 連結 | 首頁按鈕 |
| `website` | `string` | 個人網站 | 目前未使用 |
| `defaultLocale` | `string` | 預設語系 | store 初始化與 i18n fallback |
| `supportedLocales` | `string[]` | 支援語系列表 | Header 語系切換合法值 |
| `jobTitle` | `LocaleText` | 職稱（中/英） | Header 副標、首頁、Admin 可編輯 |
| `summary` | `LocaleText` | 自我摘要（中/英） | 首頁、Admin 可編輯 |
| `introLines` | `Record<locale, string[]>` | Terminal 開場文字 | 首頁 TerminalIntro |

### 3.4 `security` 欄位
| 欄位 | 型別 | 中文名稱 | 用在哪裡 |
|---|---|---|---|
| `loginPin` | `string` | 後台 PIN | Admin 登入驗證 |
| `loginHint` | `LocaleText` | PIN 提示文字 | 目前未使用（Admin 文案來自 `constants/adminText.js`） |

### 3.5 `resumeVersions` 欄位
| 欄位 | 型別 | 中文名稱 | 用在哪裡 |
|---|---|---|---|
| `id` | `string` | 版本代碼 | store 檢查選擇版本是否合法、Admin 新增專案預設值 |
| `label` | `LocaleText` | 版本名稱 | 目前未使用 |

### 3.6 `sectionCatalog` / `sectionOrder`
`sectionOrder` 實際控制首頁區塊是否顯示（`hero`、`skills`、`featuredProjects`、`timelinePreview`）。

`sectionCatalog` 目前未被元件讀取，可保留給 CMS 區塊管理功能。

### 3.7 `skills` 欄位
| 欄位 | 型別 | 中文名稱 | 用在哪裡 |
|---|---|---|---|
| `id` | `string` | 技能 ID | Admin 列表 key |
| `name` | `string` | 技能名稱 | 首頁 skills 顯示、Admin 新增/刪除 |
| `category` | `string` | 技能分類 | 目前僅儲存，前台未顯示 |

### 3.8 `experiences` 欄位
| 欄位 | 型別 | 中文名稱 | 用在哪裡 |
|---|---|---|---|
| `id` | `string` | 經歷 ID | Timeline key、Admin 選取/刪除 |
| `start` | `YYYY-MM` | 開始年月 | Timeline 顯示、排序（新到舊） |
| `end` | `YYYY-MM \| null` | 結束年月 | Timeline 顯示（null 代表至今） |
| `company` | `string` | 公司/團隊 | 首頁預覽、Timeline、Admin |
| `role` | `LocaleText` | 職稱（中/英） | 首頁預覽、Timeline、Admin |
| `summary` | `LocaleText` | 經歷摘要（中/英） | 首頁預覽、Timeline、Admin |
| `highlights` | `LocaleText[]` | 經歷亮點列表（中/英） | Timeline、Admin |

### 3.9 `projects` 欄位
| 欄位 | 型別 | 中文名稱 | 用在哪裡 |
|---|---|---|---|
| `id` | `string` | 專案 ID | 列表 key、Admin 選單 |
| `slug` | `string` | URL 識別碼 | 路由 `/projects/:slug`、Admin 選取 |
| `title` | `LocaleText` | 專案標題（中/英） | 首頁卡片、列表卡片、Detail、Admin |
| `summary` | `LocaleText` | 專案摘要（中/英） | 首頁卡片、列表卡片、Detail、Admin |
| `problem` | `LocaleText` | 問題背景（中/英） | 目前未顯示（有資料） |
| `solution` | `LocaleText` | 解法（中/英） | Detail 作為 `contributions` fallback |
| `contributions` | `LocaleText[]` | 我做了什麼（中/英） | Detail 主清單、Admin 可編輯 |
| `impact` | `LocaleText[]` | 成果影響（中/英） | 目前未顯示 |
| `tech` | `string[]` | 技術標籤 | 卡片、列表篩選、Detail、Admin 可編輯 |
| `domainTags` | `string[]` | 領域標籤 | Projects 篩選 |
| `versions` | `string[]` | 適用履歷版本 | 新增專案時帶預設值，前台目前未篩選 |
| `featured` | `boolean` | 是否精選 | 首頁精選區 |
| `updatedAt` | `YYYY-MM-DD` | 更新日期 | Projects 排序、Detail 顯示、Admin 儲存時更新 |
| `activity.commits` | `number` | commit 數 | 目前未顯示 |
| `activity.last30Days` | `number` | 30 天活動數 | 目前未顯示 |
| `links.github` | `string` | GitHub 連結 | Detail 按鈕 |
| `links.demo` | `string` | Demo 連結 | Detail 按鈕 |
| `shots[].name` | `string` | 截圖名稱 | Detail 預覽 |
| `shots[].url` | `string` | 截圖網址 | Detail 預覽 |

### 3.10 `ui` 欄位（目前實際用到的 key）
| 命名空間 | 已使用 key |
|---|---|
| `app` | `loading` |
| `common` | `present` |
| `header` | `brandFallback`, `nav.home`, `nav.projects`, `nav.timeline`, `nav.admin`, `locale.zhTw`, `locale.enUs`, `theme.dark`, `theme.light`, `print` |
| `home` | `exploreProjects`, `contact`, `skillsTitle`, `skillsDesc`, `noSkills`, `featuredProjectsTitle`, `featuredProjectsDesc`, `timelineTitle`, `seeFullTimeline` |
| `projects` | `title`, `description`, `resultCount`, `emptyState` |
| `projectCard` | `viewDetails` |
| `projectDetail` | `backToProjects`, `preview`, `notFound`, `backToList` |
| `timeline` | `title`, `description` |
| `tagFilter` | `clear` |

`ui.admin` 目前未被使用（Admin 文字改由 `src/constants/adminText.js` 提供）。

## 4) 前端目前「實際依賴」的最小必要欄位
若後端先做 MVP，以下缺少會直接影響畫面：
- `meta.ownerName`, `meta.jobTitle`, `meta.summary`, `meta.supportedLocales`, `meta.defaultLocale`
- `sectionOrder`
- `skills[].name`
- `experiences[].id/start/company/role/summary`
- `projects[].id/slug/title/summary/tech/updatedAt/featured`
- `ui`（至少要包含第 3.10 節列出的 key）

## 5) 備註（與現在行為一致）
- 專案詳細頁顯示「What I Did」時，優先吃 `contributions`；若空陣列則退回 `[solution]`。
- `selectedVersion` 目前只儲存在偏好設定，尚未套用到 `projects` 篩選邏輯。
- Admin 目前沒有編輯 `problem`、`impact`、`domainTags`、`versions`、`activity`、`links`、`shots` 的 UI，但新增專案時會建立這些欄位。
