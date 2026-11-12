const KB = 1024;
const MB = KB * 1024;
const GB = MB * 1024;

// Turns a byte count into short readable text, e.g. 134217728 -> "128 MB"
export function formatFileSize(bytes: number): string {
  if (bytes < MB) return `${Math.max(1, Math.round(bytes / KB))} KB`;
  if (bytes < GB) return `${Math.round(bytes / MB)} MB`;
  return `${(bytes / GB).toFixed(1)} GB`;
}
