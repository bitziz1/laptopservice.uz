export function formatDateRu(iso: string): string {
  const months = [
    "января","февраля","марта","апреля","мая","июня",
    "июля","августа","сентября","октября","ноября","декабря"
  ];
  const [y,m,d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(y, m-1, d);
  // validate
  if (isNaN(dt.getTime())) return iso;
  return `${d} ${months[m-1]} ${y}`;
}

export function formatThreadsDate(iso: string): string {
  const [y,m,d] = iso.split("-").map(Number);
  if (!y || !m || !d) return formatDateRu(iso);
  const dt = new Date(y, m-1, d);
  if (isNaN(dt.getTime())) return formatDateRu(iso);
  dt.setHours(0,0,0,0);
  const now = new Date();
  now.setHours(0,0,0,0);
  const diff = Math.round((now.getTime() - dt.getTime()) / 86400000);
  if (diff === 0) return "сегодня";
  if (diff === 1) return "вчера";
  return formatDateRu(iso);
}
