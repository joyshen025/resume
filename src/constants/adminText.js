const ADMIN_TEXT = {
  'zh-TW': {
    title: '履歷 CMS (無後端示範)',
    description: '登入後可編輯主資料、專案與經歷，資料會儲存於 localStorage',
    untitledExperience: '未命名經歷',
    login: {
      title: '登入',
      hint: 'Demo PIN: 2026',
      pinPlaceholder: '請輸入 PIN',
      button: '登入',
      error: 'PIN 錯誤，請再試一次',
    },
    meta: {
      title: '個人主資料',
      save: '儲存主資料',
    },
    project: {
      title: '專案摘要編輯',
      select: '選擇專案',
      tech: '技術 / 套件',
      techPlaceholder: '輸入技術名稱後按新增',
      add: '新增',
      remove: '移除',
      emptyTech: '尚未新增技術',
      save: '儲存專案摘要',
    },
    experience: {
      title: '經歷編輯',
      select: '選擇經歷',
      add: '新增經歷',
      remove: '刪除目前經歷',
      company: '公司 / 團隊',
      start: '開始 (YYYY-MM)',
      end: '結束 (YYYY-MM)',
      hint: '每行一項，中文與英文會依行號配對。',
      save: '儲存經歷',
    },
    actions: {
      title: '操作',
      restore: '還原預設 JSON',
      logout: '登出',
    },
    fieldName: '姓名',
    fieldJobTitle: '職稱',
    fieldSummary: '摘要',
    fieldRole: '角色',
    fieldHighlights: '重點',
    fieldSkills: '技能',
    localeZh: '中文 (ZH)',
    localeEn: '英文 (EN)',
    projectSummaryZh: '摘要（中文）',
    projectSummaryEn: '摘要（英文）',
    projectContributionZh: '我做了什麼（中文）',
    projectContributionEn: '我做了什麼（英文）',
    projectContributionHint: '每行一項，中文與英文會依行號配對。',
    skillsPlaceholder: '輸入技能後按新增',
    skillsAdd: '新增',
    skillsRemove: '移除',
    skillsEmpty: '尚未新增技能',
    saveNotice: {
      meta: {
        success: '主資料已儲存',
        error: '主資料儲存失敗',
      },
      project: {
        success: '專案已儲存',
        error: '專案儲存失敗',
      },
      experience: {
        success: '經歷已儲存',
        error: '經歷儲存失敗',
      },
    },
  },
  'en-US': {
    title: 'Resume CMS (No Backend Demo)',
    description: 'After login, you can edit meta, projects, and experiences; data is saved in localStorage',
    untitledExperience: 'Untitled Experience',
    login: {
      title: 'Login',
      hint: 'Demo PIN: 2026',
      pinPlaceholder: 'Enter PIN',
      button: 'Login',
      error: 'Incorrect PIN. Please try again.',
    },
    meta: {
      title: 'Personal Profile',
      save: 'Save Profile',
    },
    project: {
      title: 'Project Summary Editor',
      select: 'Select Project',
      tech: 'Tech / Stack',
      techPlaceholder: 'Type a tech name and click Add',
      add: 'Add',
      remove: 'Remove',
      emptyTech: 'No tech items yet',
      save: 'Save Project Summary',
    },
    experience: {
      title: 'Experience Editor',
      select: 'Select Experience',
      add: 'Add Experience',
      remove: 'Remove Current Experience',
      company: 'Company / Team',
      start: 'Start (YYYY-MM)',
      end: 'End (YYYY-MM)',
      hint: 'One item per line. ZH and EN lines are matched by index.',
      save: 'Save Experience',
    },
    actions: {
      title: 'Actions',
      restore: 'Restore Seed JSON',
      logout: 'Logout',
    },
    fieldName: 'Name',
    fieldJobTitle: 'Job Title',
    fieldSummary: 'Summary',
    fieldRole: 'Role',
    fieldHighlights: 'Highlights',
    fieldSkills: 'Skills',
    localeZh: 'ZH (Chinese)',
    localeEn: 'EN (English)',
    projectSummaryZh: 'Summary (ZH)',
    projectSummaryEn: 'Summary (EN)',
    projectContributionZh: 'What I Did (ZH)',
    projectContributionEn: 'What I Did (EN)',
    projectContributionHint: 'One item per line. ZH and EN lines are matched by index.',
    skillsPlaceholder: 'Type a skill and click Add',
    skillsAdd: 'Add',
    skillsRemove: 'Remove',
    skillsEmpty: 'No skills yet',
    saveNotice: {
      meta: {
        success: 'Profile saved.',
        error: 'Profile save failed.',
      },
      project: {
        success: 'Project saved.',
        error: 'Project save failed.',
      },
      experience: {
        success: 'Experience saved.',
        error: 'Experience save failed.',
      },
    },
  },
};

// 將輸入語系正規化成目前支援的語系代碼。
function normalizeLocale(locale) {
  if (locale === 'en-US') {
    return 'en-US';
  }

  return 'zh-TW';
}

// 依語系取得 CMS 介面文案。
export function getAdminText(locale) {
  return ADMIN_TEXT[normalizeLocale(locale)];
}

// 依區塊與成功狀態取得對應的儲存通知文字。
export function getAdminSaveNotice(locale, section, isSuccess) {
  const text = getAdminText(locale);
  const sectionMap = text.saveNotice[section];

  if (!sectionMap) {
    return isSuccess ? text.saveNotice.meta.success : text.saveNotice.meta.error;
  }

  return isSuccess ? sectionMap.success : sectionMap.error;
}
