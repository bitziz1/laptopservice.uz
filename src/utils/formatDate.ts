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
