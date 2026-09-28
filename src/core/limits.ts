import { ExtremeWeatherAlert } from './models';

/**
 * 统一容量保护阈值。
 * 分层生效：核心计算负责文本与预警口径，存储适配器负责记录总量，
 * 界面层负责渲染数量，三层共用同一组常量避免口径漂移。
 */
export const CAPACITY = {
  /** 持久化最多保留的观测记录数（超出后按日期保留最近） */
  MAX_STORED_RECORDS: 365,
  /** 单条观测备注允许的最大字符数 */
  MAX_NOTE_LENGTH: 200,
  /** 时间序列条最多渲染的观测标本数 */
  MAX_TIMELINE_RECORDS: 14,
  /** 领域计算最多保留的预警数量 */
  MAX_DOMAIN_ALERTS: 10,
  /** 预警面板最多展示的预警条目数 */
  MAX_DISPLAYED_ALERTS: 2,
  /** 每条预警最多展示的防灾协议条数 */
  MAX_DEFENSE_STEPS: 4,
  /** 长文本在卡片中的单行预览字符数 */
  MAX_PREVIEW_LENGTH: 60
} as const;

const ALERT_LEVEL_RANK: Record<string, number> = {
  红色: 0,
  橙色: 1,
  黄色: 2,
  蓝色: 3
};

/** 规整备注：去除首尾空白并截断到允许长度，避免超长文本撑破布局或写爆存储 */
export function clampNote(note: string): string {
  const normalized = (note ?? '').trim();
  return normalized.length > CAPACITY.MAX_NOTE_LENGTH
    ? normalized.slice(0, CAPACITY.MAX_NOTE_LENGTH)
    : normalized;
}

/** 将记录集合裁剪到容量上限：始终保留日期最近的一批，返回按日期升序的新数组 */
export function capRecordList<T extends { date: string }>(
  records: T[],
  max: number = CAPACITY.MAX_STORED_RECORDS
): T[] {
  if (records.length <= max) return records;
  return [...records]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, max)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/** 预警按严重级别（红 > 橙 > 黄 > 蓝）、再按发布时间排序 */
export function rankAlerts(alerts: ExtremeWeatherAlert[]): ExtremeWeatherAlert[] {
  return [...alerts].sort(
    (a, b) =>
      (ALERT_LEVEL_RANK[a.level] ?? 9) - (ALERT_LEVEL_RANK[b.level] ?? 9) ||
      a.issuedTime.localeCompare(b.issuedTime)
  );
}

/** 将长文本折叠为单行预览，超长时以省略号收尾 */
export function previewText(text: string, max: number = CAPACITY.MAX_PREVIEW_LENGTH): string {
  const collapsed = (text ?? '').replace(/\s+/g, ' ').trim();
  return collapsed.length > max ? `${collapsed.slice(0, max)}…` : collapsed;
}
