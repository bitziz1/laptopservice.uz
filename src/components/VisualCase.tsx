import { useRef, useEffect, useState, useCallback } from "react";
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
  const captions: string[] = (() => {
    const caps = (c.captions ?? []) as string[];
    const hasHero = !!c.heroImage;
    if (!hasHero) return caps;
    return ["", ...caps];
  })();

  const dateStr = String(c.date).slice(0, 10);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [needScroll, setNeedScroll] = useState(true);
  const [lightbox, setLightbox] = useState<{ src: string; caption: string; alt: string } | null>(null);

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
    const card = el.querySelector<HTMLElement>("figure.shrink-0");
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

  const open = (idx: number) => {
    setLightbox({ src: gallery[idx], alt: captions[idx] || c.title, caption: captions[idx] || "" });
  };

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

      {gallery.length === 1 ? (
        <figure className="rounded-xl overflow-hidden border border-chassis-800 bg-chassis-900 cursor-zoom-in group" data-tina-field={tinaField(c, "gallery")} onClick={() => open(0)} role="button" tabIndex={0} onKeyDown={(e)=>{ if(e.key==='Enter'||e.key===' ') { e.preventDefault(); open(0); } }}>
          <img src={gallery[0]} alt={captions[0] || c.title} className="w-full h-auto object-contain cursor-zoom-in group-hover:opacity-95 transition" />
          {captions[0] && <figcaption className="px-3 py-2 text-[11px] leading-snug text-chassis-300 bg-chassis-950/60 border-t border-chassis-800">{captions[0]}</figcaption>}
        </figure>
      ) : gallery.length > 1 ? (
        <div className="relative" data-tina-field={tinaField(c, "gallery")}>
          <button type="button" aria-label="Назад" onClick={() => scrollBy(-1)} disabled={atStart} className="hidden md:flex absolute left-1 lg:-left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-white hover:bg-black/85 transition shadow-lg disabled:opacity-30 disabled:pointer-events-none" style={{ display: needScroll ? undefined : "none" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button type="button" aria-label="Вперед" onClick={() => scrollBy(1)} disabled={atEnd} className="hidden md:flex absolute right-1 lg:-right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-white hover:bg-black/85 transition shadow-lg disabled:opacity-30 disabled:pointer-events-none" style={{ display: needScroll ? undefined : "none" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
          </button>
          <div ref={scrollerRef} className="flex gap-3 overflow-x-auto overflow-y-hidden pb-2 snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: "none" } as any}>
            {gallery.map((src: string, i: number) => (
              <figure key={src} className="shrink-0 snap-start w-[88vw] sm:w-[520px] rounded-xl overflow-hidden border border-chassis-800 bg-chassis-900 cursor-zoom-in flex flex-col group" onClick={() => open(i)} role="button" tabIndex={0} onKeyDown={(e)=>{ if(e.key==='Enter'||e.key===' ') { e.preventDefault(); open(i); } }}>
                <div className="relative flex-1 bg-chassis-900">
                  <img src={src} alt={captions[i] || c.title} className="w-full h-[240px] sm:h-[340px] object-contain sm:object-cover cursor-zoom-in group-hover:opacity-95 transition" loading="lazy" />
                </div>
                {captions[i] ? (
                  <figcaption className="px-3 py-2.5 text-[11px] leading-snug text-chassis-300 bg-chassis-950/70 border-t border-chassis-800 line-clamp-2">{captions[i]}</figcaption>
                ) : (
                  <figcaption className="sr-only">{c.title} — фото {i+1}</figcaption>
                )}
              </figure>
            ))}
          </div>
          <div className="mt-1 text-[10px] font-sans text-chassis-500 text-center sm:text-right">Нажмите на фото для увеличения • {gallery.length} фото</div>
        </div>
      ) : null}
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setLightbox(null)} aria-hidden="true">
          <figure className="flex flex-col items-center max-w-[95vw] max-h-[92vh]" onClick={(e)=> e.stopPropagation()}>
            <img src={lightbox.src} alt={lightbox.alt} className="max-w-[95vw] max-h-[82vh] object-contain rounded-xl border border-white/10 shadow-2xl" />
            {lightbox.caption && <figcaption className="mt-3 max-w-[90vw] text-center text-xs sm:text-sm text-white/80 leading-snug px-2">{lightbox.caption}</figcaption>}
          </figure>
          <button type="button" aria-label="Закрыть" onClick={() => setLightbox(null)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 border border-white/15 text-white flex items-center justify-center hover:bg-black/80 transition">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
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
