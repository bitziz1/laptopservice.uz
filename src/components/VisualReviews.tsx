import { useRef, useEffect, useState, useCallback } from "react";
import { useTina, tinaField } from "tinacms/dist/react";
import { TinaMarkdown } from "tinacms/dist/rich-text";

export default function VisualReviews(props: { query: string; variables: any; data: any; variant?: "home" | "page" }) {
  const { data } = useTina(props);
  const edges = data.reviewsConnection?.edges ?? [];
  const reviews = edges.map((e: any) => e.node).filter(Boolean);
  reviews.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const limit = props.variant === "home" ? 8 : reviews.length;

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [needScroll, setNeedScroll] = useState(true);
  const updateButtons = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setAtStart(scrollLeft <= 4);
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - 4);
    setNeedScroll(scrollWidth > clientWidth + 8);
  }, []);
  useEffect(() => {
    if (props.variant !== "home") return;
    const el = scrollerRef.current;
    if (!el) return;
    updateButtons();
    el.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    const ro = new ResizeObserver(updateButtons);
    ro.observe(el);
    const t = setTimeout(updateButtons, 150);
    return () => {
      el.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
      ro.disconnect();
      clearTimeout(t);
    };
  }, [updateButtons, props.variant, reviews.length]);
  const scrollBy = (dir: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".shrink-0");
    const amount = card ? card.offsetWidth + 10 : el.clientWidth * 0.85;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <>
      {props.variant === "home" && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sky-400 text-[10px]">Tina live ✓ — отзыв клик = редактирование</span>
        </div>
      )}
      {props.variant === "home" ? (
        <div className="relative">
          <button type="button" aria-label="Прокрутить назад" onClick={() => scrollBy(-1)} disabled={atStart} className="hidden md:flex absolute left-1 lg:-left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-white hover:bg-black/85 transition shadow-lg disabled:opacity-30 disabled:pointer-events-none" style={{ display: needScroll ? undefined : "none" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button type="button" aria-label="Прокрутить вперед" onClick={() => scrollBy(1)} disabled={atEnd} className="hidden md:flex absolute right-1 lg:-right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-white hover:bg-black/85 transition shadow-lg disabled:opacity-30 disabled:pointer-events-none" style={{ display: needScroll ? undefined : "none" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
          </button>
          <div ref={scrollerRef} className="horizontal-scroller flex gap-2.5 overflow-x-auto overflow-y-hidden pb-2 snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 items-start">
            {reviews.slice(0, limit).map((node: any) => {
              const avatar = node.avatar as string | null;
              const gallery: string[] = node.gallery ?? [];
              const captions: string[] = node.captions ?? [];
              const dateStr = String(node.date).slice(0, 10);
              return (
                <div key={node.id} className="shrink-0 snap-start w-[270px] sm:w-[290px] bg-chassis-850 border border-chassis-800 rounded-[14px] overflow-hidden flex flex-col p-3.5 self-start h-auto" data-tina-field={tinaField(node, "body")}>
                  <div className="flex items-center gap-2.5 mb-2">
                    {avatar ? <img src={avatar} alt={node.author} className="w-7 h-7 rounded-full object-cover border border-chassis-700 shrink-0" /> : <div className="w-7 h-7 rounded-full bg-chassis-900 border border-chassis-800 flex items-center justify-center text-[11px] font-bold text-chassis-200 shrink-0">{node.author.charAt(0).toUpperCase()}</div>}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-chassis-100 leading-none truncate" data-tina-field={tinaField(node, "author")}>{node.author}</div>
                      <div className="text-[10px] text-chassis-500 leading-none mt-0.5 truncate"><span data-tina-field={tinaField(node, "device")}>{node.device}</span> · <span data-tina-field={tinaField(node, "source")}>{node.source}</span></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mb-1.5"><span className="text-[11px] text-amber-400 leading-none">★★★★★</span><span className="text-[11px] font-sans text-chassis-500" data-tina-field={tinaField(node, "date")}>{dateStr}</span></div>
                  <div className="text-xs text-chassis-300 leading-relaxed italic" data-tina-field={tinaField(node, "body")}><TinaMarkdown content={node.body} /></div>
                  {gallery.length > 0 && <div className="mt-2.5" data-tina-field={tinaField(node, "gallery")}><div className="rounded-lg overflow-hidden border border-chassis-800 bg-chassis-900"><img src={gallery[0]} alt={captions[0] ?? ""} className="w-full h-[110px] object-cover" /></div>{captions[0] && <div className="text-[10px] font-sans text-chassis-500 mt-1 truncate">{captions[0]}</div>}</div>}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start auto-rows-auto">
          {reviews.slice(0, limit).map((node: any) => {
            const avatar = node.avatar as string | null;
            const gallery: string[] = node.gallery ?? [];
            const captions: string[] = node.captions ?? [];
            const dateStr = String(node.date).slice(0, 10);
            return (
              <div key={node.id} className="rounded-lg bg-chassis-850/50 p-5 sm:p-6 flex flex-col space-y-4 h-auto self-start border border-chassis-800" data-tina-field={tinaField(node, "body")}>
                <div className="flex items-center gap-2.5 mb-2">
                  {avatar ? <img src={avatar} alt={node.author} className="w-7 h-7 rounded-full object-cover border border-chassis-700 shrink-0" /> : <div className="w-7 h-7 rounded-full bg-chassis-900 border border-chassis-800 flex items-center justify-center text-[11px] font-bold text-chassis-200 shrink-0">{node.author.charAt(0).toUpperCase()}</div>}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-chassis-100 leading-none truncate" data-tina-field={tinaField(node, "author")}>{node.author}</div>
                    <div className="text-[10px] text-chassis-500 leading-none mt-0.5 truncate"><span data-tina-field={tinaField(node, "device")}>{node.device}</span> · <span data-tina-field={tinaField(node, "source")}>{node.source}</span></div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mb-1.5"><span className="text-[11px] text-amber-400 leading-none">★★★★★</span><span className="text-[11px] font-sans text-chassis-500" data-tina-field={tinaField(node, "date")}>{dateStr}</span></div>
                <div className="text-xs text-chassis-300 leading-relaxed italic" data-tina-field={tinaField(node, "body")}><TinaMarkdown content={node.body} /></div>
                {gallery.length > 0 && <div className="mt-2.5" data-tina-field={tinaField(node, "gallery")}><div className="rounded-lg overflow-hidden border border-chassis-800 bg-chassis-900"><img src={gallery[0]} alt={captions[0] ?? ""} className="w-full h-[110px] object-cover" /></div>{captions[0] && <div className="text-[10px] font-sans text-chassis-500 mt-1 truncate">{captions[0]}</div>}</div>}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
