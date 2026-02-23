const ADMIN_TEXT = {
  'zh-TW': {
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
    skillsHint: '每行一個技能名稱。',
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
    skillsHint: 'One skill name per line.',
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

function normalizeLocale(locale) {
  return locale === 'en-US' ? 'en-US' : 'zh-TW';
}

export function getAdminText(locale) {
  return ADMIN_TEXT[normalizeLocale(locale)];
}

export function getAdminSaveNotice(locale, section, isSuccess) {
  const text = getAdminText(locale);
  const sectionMap = text.saveNotice[section];

  if (!sectionMap) {
    return isSuccess ? text.saveNotice.meta.success : text.saveNotice.meta.error;
  }

  return isSuccess ? sectionMap.success : sectionMap.error;
}
