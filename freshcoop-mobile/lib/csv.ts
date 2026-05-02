import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

function escape(value: any): string {
  const s = value === null || value === undefined ? '' : String(value);
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function rowsToCsv(rows: Record<string, any>[], columns: string[]): string {
  const header = columns.map(escape).join(',');
  const body = rows.map((r) => columns.map((c) => escape(r[c])).join(',')).join('\n');
  return `${header}\n${body}`;
}

export async function shareCsv(filename: string, csv: string): Promise<void> {
  const dir = (FileSystem as any).cacheDirectory || '';
  const path = `${dir}${filename}`;
  await FileSystem.writeAsStringAsync(path, csv, {
    encoding: 'utf8' as any,
  });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path, {
      mimeType: 'text/csv',
      dialogTitle: filename,
      UTI: 'public.comma-separated-values-text',
    });
  }
}
