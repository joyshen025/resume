export function localizeText(value, locale, fallbackLocale = 'zh-TW') {
  // 筆記：如果資料本來就是純字串，就直接回傳不做轉換。
  if (typeof value === 'string') {
    return value;
  }

  if (!value || typeof value !== 'object') {
    return '';
  }

  if (value[locale]) {
    return value[locale];
  }

  // 沒有目前語系就退回預設語系，至少保底可讀。
  if (value[fallbackLocale]) {
    return value[fallbackLocale];
  }

  // 最後再保底拿第一個值，避免畫面噴空字串。
  const firstValue = Object.values(value)[0];
  return typeof firstValue === 'string' ? firstValue : '';
}
