function parseYearMonth(value) {
  if (!value) {
    return null;
  }

  // 這邊吃 YYYY-MM，沒有月分就預設 01。
  const [yearPart, monthPart = '01'] = value.split('-');
  const year = Number.parseInt(yearPart, 10);
  const month = Number.parseInt(monthPart, 10);

  if (Number.isNaN(year) || Number.isNaN(month)) {
    return null;
  }

  return new Date(year, month - 1, 1);
}

function formatMonth(value, locale) {
  const dateValue = parseYearMonth(value);

  if (!dateValue) {
    return '';
  }

  // 用 Intl 走語系格式化，中文英文會自動對齊。
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
  }).format(dateValue);
}

export function formatPeriod(start, end, locale, presentLabel) {
  // 這個函式統一處理 timeline 的日期區間顯示。
  const startLabel = formatMonth(start, locale);
  const endLabel = end ? formatMonth(end, locale) : presentLabel;

  if (!startLabel && !endLabel) {
    return '';
  }

  if (!startLabel) {
    return endLabel;
  }

  if (!endLabel) {
    return startLabel;
  }

  return `${startLabel} - ${endLabel}`;
}
