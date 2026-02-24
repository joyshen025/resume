# Data 筆記

`resume.json` 是正式資料來源，因為是純 JSON 格式所以不能直接寫註解。

我自己的維護筆記放這裡：

- `meta`: 個人基本資料 + 多語系文案（首頁會直接吃）
- `security`: 後台 demo 登入 PIN（現在是前端模擬）
- `resumeVersions`: 履歷版本切換（前端版 / 醫療版 / 國際版）
- `sectionCatalog` + `sectionOrder`: 首頁區塊清單與排序
- `skills`: 技能條列資料（首頁 bar 與後續擴充可用）
- `experiences`: 時間線資料
- `projects`: 專案主資料（列表、詳情、tag filter 都靠這裡）

小提醒：

- 想重置資料可以去 CMS 點「還原預設 JSON」。
- 想改欄位結構時，記得一起看 `src/stores/resumeStore.js`。
