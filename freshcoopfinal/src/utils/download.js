import { csvCell } from './helpers.js';

export function downloadCsv(filename, rows) {
  downloadText(filename, rows.map((row) => row.map(csvCell).join(';')).join('\n'), 'text/csv;charset=utf-8;');
}

export function downloadJson(filename, value) {
  downloadText(filename, JSON.stringify(value, null, 2), 'application/json;charset=utf-8;');
}

export function downloadHtml(filename, html) {
  downloadText(filename, html, 'text/html;charset=utf-8;');
}

export function downloadText(filename, text, type) {
  const content = type.startsWith('text/csv') ? `﻿${text}` : text;
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadDataUrl(file) {
  const anchor = document.createElement('a');
  anchor.href = file.dataUrl;
  anchor.download = file.name;
  anchor.click();
}

export function printHtml(html) {
  const popup = window.open('', '_blank');
  if (!popup) return;
  popup.document.open();
  popup.document.write(html);
  popup.document.close();
  popup.focus();
  popup.print();
}
