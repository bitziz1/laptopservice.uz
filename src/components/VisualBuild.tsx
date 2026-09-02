import { useRef, useEffect, useState, useCallback } from "react";
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

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [needScroll, setNeedScroll] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
    setNeedScroll(el.scrollWidth > el.clientWidth + 8);
  }, []);
  useEffect(() => {
    if (gallery.length <= 1) return;
    const el = scrollerRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    const t = setTimeout(updateArrows, 150);
    return () => { el.removeEventListener("scroll", updateArrows); window.removeEventListener("resize", updateArrows); ro.disconnect(); clearTimeout(t); };
  }, [updateArrows, gallery.length]);
  const scrollBy = (dir: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".shrink-0");
    const amount = card ? card.offsetWidth + 12 : el.clientWidth * 0.85;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLightbox(null); };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prevOverflow; };
  }, [lightbox]);

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

      {gallery.length === 1 ? (
        <div className="rounded-lg overflow-hidden border border-chassis-800 bg-chassis-900 cursor-zoom-in" data-tina-field={tinaField(b, "gallery")} onClick={() => setLightbox(gallery[0])} role="button" tabIndex={0} onKeyDown={(e)=>{ if(e.key==='Enter'||e.key===' ') { e.preventDefault(); setLightbox(gallery[0]); } }}>
          <img src={gallery[0]} alt={b.title} className="w-full h-auto object-contain cursor-zoom-in" />
        </div>
      ) : gallery.length > 1 ? (
        <div className="relative" data-tina-field={tinaField(b, "gallery")}>
          <button type="button" aria-label="Назад" onClick={() => scrollBy(-1)} disabled={atStart} className="hidden md:flex absolute left-1 lg:-left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-white hover:bg-black/85 transition shadow-lg disabled:opacity-30 disabled:pointer-events-none" style={{ display: needScroll ? undefined : "none" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button type="button" aria-label="Вперед" onClick={() => scrollBy(1)} disabled={atEnd} className="hidden md:flex absolute right-1 lg:-right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-white hover:bg-black/85 transition shadow-lg disabled:opacity-30 disabled:pointer-events-none" style={{ display: needScroll ? undefined : "none" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
          </button>
          <div ref={scrollerRef} className="flex gap-3 overflow-x-auto overflow-y-hidden pb-2 snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: "none" } as any}>
            {gallery.map((src: string) => (
              <div key={src} className="shrink-0 snap-start w-[88vw] sm:w-[520px] rounded-lg overflow-hidden border border-chassis-800 bg-chassis-900 cursor-zoom-in" onClick={() => setLightbox(src)} role="button" tabIndex={0} onKeyDown={(e)=>{ if(e.key==='Enter'||e.key===' ') { e.preventDefault(); setLightbox(src); } }}>
                <img src={src} alt={b.title} className="w-full h-[240px] sm:h-[340px] object-contain sm:object-cover cursor-zoom-in" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setLightbox(null)} aria-hidden="true">
          <img src={lightbox} alt={b.title} className="max-w-[95vw] max-h-[92vh] object-contain rounded-lg border border-white/10 shadow-2xl" onClick={(e)=> e.stopPropagation()} />
          <button type="button" aria-label="Закрыть" onClick={() => setLightbox(null)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 border border-white/15 text-white flex items-center justify-center hover:bg-black/80 transition">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
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
