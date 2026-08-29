import { useTina, tinaField } from "tinacms/dist/react";
import { TinaMarkdown } from "tinacms/dist/rich-text";

export default function VisualCase(props: { query: string; variables: any; data: any }) {
  const { data } = useTina(props);
  const c: any = data.cases;

  const gallery: string[] = (() => {
    const g = (c.gallery ?? []) as string[];
    const h = c.heroImage as string | null;
    return h ? [h, ...g].filter(Boolean) : g;
  })();

  const dateStr = String(c.date).slice(0, 10);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
          <span className="text-chassis-400 font-bold uppercase tracking-wider" data-tina-field={tinaField(c, "category")}>{c.category}</span>
          <span className="text-chassis-400">•</span>
          <time className="text-chassis-400" data-tina-field={tinaField(c, "date")}>{dateStr}</time>
          <span className="text-sky-400 text-[10px]">Tina live ✓</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-extrabold text-chassis-100 tracking-tight leading-tight" data-tina-field={tinaField(c, "title")}>{c.title}</h1>
        <div className="text-xs font-sans text-chassis-300" data-tina-field={tinaField(c, "device")}>Устройство: <strong className="text-chassis-100">{c.device}</strong></div>
      </header>

      {gallery.length > 0 && (
        <div className={gallery.length === 1 ? "rounded-lg overflow-hidden border border-chassis-800 bg-chassis-900" : "grid grid-cols-1 sm:grid-cols-2 gap-3"} data-tina-field={tinaField(c, "gallery")}>
          {gallery.map((src: string) => (
            <div key={src} className="rounded-lg overflow-hidden border border-chassis-800 bg-chassis-900">
              <img src={src} alt={c.title} className="w-full h-auto object-contain" />
            </div>
          ))}
        </div>
      )}

      {c.keySpecs && (
        <div className="py-2 space-y-3" data-tina-field={tinaField(c, "keySpecs")}>
          <div className="text-xs font-sans text-chassis-400 uppercase tracking-wider">Параметры ремонта</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {c.keySpecs.map((s: any, i: number) => (
              <div key={i} className="space-y-1">
                <span className="text-chassis-400 block text-[11px] uppercase tracking-wider">{s.label}</span>
                <span className="text-chassis-200 font-bold font-mono">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <article className="prose prose-invert max-w-none prose-sm sm:prose-base prose-headings:text-chassis-100 prose-p:text-chassis-300 prose-strong:text-chassis-100 prose-li:text-chassis-300" data-tina-field={tinaField(c, "body")}>
        <TinaMarkdown content={c.body} />
      </article>

      <div className="flex flex-wrap gap-2 pt-2" data-tina-field={tinaField(c, "tags")}>
        {(c.tags ?? []).map((tag: string) => (
          <span key={tag} className="text-[11px] font-sans text-sky-400">#{tag}</span>
        ))}
      </div>
    </div>
  );
}
