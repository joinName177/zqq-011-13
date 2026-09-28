import { MoodRecord } from './models';
import { CAPACITY } from './limits';

/** CSV 字段转义：统一包裹双引号并转义内部引号，保证逗号、换行等特殊字符编码一致 */
function escapeCsvField(value: string | number): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

/**
 * 基于完整数据快照导出全量观测记录（不受界面渲染数量限制）。
 * 带 UTF-8 BOM，避免中文在 Excel 中乱码。
 */
export function exportRecordsAsCsv(records: readonly MoodRecord[]): string {
  const header = [
    'id',
    'date',
    'tag',
    'intensity',
    'note',
    'pressureHpa',
    'temperatureC',
    'humidityPercent',
    'windSpeedKmH',
    'windDirectionDeg',
    'windDirectionName'
  ];
  const rows = [...records]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(record =>
      [
        record.id,
        record.date,
        record.tag,
        record.intensity,
        record.note,
        record.pressureHpa,
        record.temperatureC,
        record.humidityPercent,
        record.windSpeedKmH,
        record.windDirectionDeg,
        record.windDirectionName
      ]
        .map(escapeCsvField)
        .join(',')
    );
  return '\uFEFF' + [header.join(','), ...rows].join('\r\n');
}

/** 触发浏览器下载，文件名带日期与导出条数 */
export function downloadRecordsCsv(records: readonly MoodRecord[]): void {
  const csv = exportRecordsAsCsv(records);
  const dateStr = new Date().toISOString().split('T')[0];
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `mood-meteorology-${dateStr}-${records.length}records.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** 备注长度限制（供界面计数器与输入框使用） */
export const NOTE_MAX_LENGTH = CAPACITY.MAX_NOTE_LENGTH;
