import { useTina, tinaField } from "tinacms/dist/react";
import { TinaMarkdown } from "tinacms/dist/rich-text";

export default function VisualBuild(props: { query: string; variables: any; data: any }) {
  const { data } = useTina(props);
  const b: any = (data as any).builds;

  const componentLabels: Record<string, string> = {
    cpu: "Процессор",
    motherboard: "Материнская плата",
    ram: "Оперативная память",
    gpu: "Видеокарта",
    storage: "Накопители",
    psu: "Блок питания",
    case: "Корпус",
    cooler: "Охлаждение",
  };

  const entries = Object.entries(b.components ?? {}).filter(([k]) => !k.startsWith("_")) as [string, string][];

  const gallery: string[] = (() => {
    const g = (b.gallery ?? []) as string[];
    const h = b.heroImage as string | null;
    return h ? [h, ...g].filter(Boolean) : g;
  })();

  const dateStr = String(b.date).slice(0, 10);

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-chassis-400 font-bold uppercase tracking-wider" data-tina-field={tinaField(b, "purposeLabel")}>
            {b.purposeLabel}
          </span>
          <span className="text-chassis-400">• {dateStr}</span>
          <span className="text-sky-400 text-[10px]">Tina live ✓</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-chassis-100 tracking-tight leading-tight" data-tina-field={tinaField(b, "title")}>
          {b.title}
        </h1>
        <p className="text-sm sm:text-base text-chassis-300 leading-relaxed" data-tina-field={tinaField(b, "description")}>
          {b.description}
        </p>
      </header>

      {gallery.length > 0 && (
        <div className={gallery.length === 1 ? "rounded-lg overflow-hidden border border-chassis-800 bg-chassis-900" : "grid grid-cols-1 sm:grid-cols-2 gap-3"} data-tina-field={tinaField(b, "gallery")}>
          {gallery.map((src: string) => (
            <div key={src} className="rounded-lg overflow-hidden border border-chassis-800 bg-chassis-900">
              <img src={src} alt={b.title} className="w-full h-auto object-contain" />
            </div>
          ))}
        </div>
      )}

      <article className="prose prose-invert max-w-none prose-sm sm:prose-base prose-headings:text-chassis-100 prose-p:text-chassis-300" data-tina-field={tinaField(b, "body")}>
        <TinaMarkdown content={b.body} />
      </article>

      <section className="py-2 space-y-4" data-tina-field={tinaField(b, "components")}>
        <h2 className="text-sm font-bold text-chassis-200 uppercase font-sans tracking-wider">Состав</h2>
        <div className="space-y-4 text-xs font-mono">
          {entries.map(([k, v]) => (
            <div key={k} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
              <span className="text-chassis-400 shrink-0 sm:w-40 font-sans font-bold uppercase text-[11px] tracking-wider">{componentLabels[k] ?? k}</span>
              <span className="text-chassis-200 leading-relaxed" data-tina-field={tinaField(b.components, k)}>{v as string}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-2 pt-2" data-tina-field={tinaField(b, "tags")}>
        {(b.tags ?? []).map((tag: string) => (
          <span key={tag} className="text-[11px] font-sans text-sky-400">#{tag}</span>
        ))}
      </div>
    </div>
  );
}
