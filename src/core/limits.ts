// 容量保护：限制记录数量、文本长度与展示数量，防止大数据量 / 超长文本
// 导致的页面卡顿与布局溢出。
// 注意：这些限制只作用于持久化与界面展示层；核心统计（气压均值、气压带、
// 季风、预警、导出摘要）始终基于完整记录集计算，统计口径不被截断。

export const MAX_RECORDS_STORED = 120;   // 本地最多保留的历史观测记录数（超出后按日期保留最新）
export const MAX_NOTE_LENGTH = 200;      // 单条心绪注记允许的最大字符数
export const MAX_TIMELINE_DISPLAY = 14;  // 近期观测序列条带最多展示的记录数
export const MAX_ALERTS_DISPLAY = 3;     // 预警面板最多同时展示的预警条数
export const MAX_DEFENSE_DISPLAY = 4;    // 单条预警最多展示自愈协议条目数
export const MAX_TITLE_DISPLAY = 40;     // 标题类文本的展示上限
export const MAX_TEXT_DISPLAY = 90;      // 原因 / 描述类长文本的展示上限

/** 折叠连续空白并截断超长文本，追加省略号，保证展示不撑破布局。 */
export function clampText(text: string, max: number): string {
  const normalized = (text ?? '').replace(/\s+/g, ' ').trim();
  if (normalized.length <= max) return normalized;
  return normalized.slice(0, Math.max(0, max - 1)).trimEnd() + '…';
}

/** 按日期升序排序后保留最近 max 条记录，用于持久化容量保护。 */
export function capRecordsByDate<T extends { date: string }>(records: readonly T[], max: number): T[] {
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  return sorted.length > max ? sorted.slice(sorted.length - max) : sorted;
}
