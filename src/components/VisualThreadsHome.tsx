import { useRef, useEffect, useState, useCallback } from "react";
import { useTina, tinaField } from "tinacms/dist/react";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { formatThreadsDate } from "@/utils/formatDate";
import { siteConfig } from "@/data/siteConfig";

function extractText(body: any): string {
  if (!body) return "";
  if (typeof body === "string") return body;
  if (body.type === "root" && Array.isArray(body.children)) {
    return body.children
      .map((n: any) => (n.children || []).map((c: any) => c.text || "").join(""))
      .join(" ")
      .slice(0, 80);
  }
  return "";
}

export default function VisualThreadsHome(props: { query: string; variables: any; data: any }) {
  const { data } = useTina(props);
  const edges = data.threadsConnection?.edges ?? [];
  const threads = edges.map((e: any) => e.node).filter(Boolean);
  threads.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
  }, [updateButtons, threads.length]);

  // Autoplay videos everywhere (Tina live)
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const videos = el.querySelectorAll<HTMLVideoElement>(".threads-video");
    if (!videos.length) return;
    const tryPlay = (v: HTMLVideoElement) => {
      v.muted = true;
      (v as any).defaultMuted = true;
      (v as any).playsInline = true;
      const p = v.play();
      if (p && typeof (p as any).catch === "function") (p as Promise<void>).catch(() => {});
    };
    videos.forEach((v) => {
      if (v.readyState >= 1) tryPlay(v);
      else v.addEventListener("loadedmetadata", () => tryPlay(v), { once: true });
      v.addEventListener("canplay", () => tryPlay(v), { once: true });
    });
    const onFirstInteract = () => videos.forEach(tryPlay);
    window.addEventListener("touchstart", onFirstInteract, { once: true, passive: true } as any);
    window.addEventListener("click", onFirstInteract, { once: true } as any);
    let io: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => entries.forEach((e) => {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) tryPlay(v);
          else v.pause();
        }),
        { threshold: 0.25 },
      );
      videos.forEach((v) => io!.observe(v));
    }
    const onVis = () => { if (!document.hidden) videos.forEach(tryPlay); };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("touchstart", onFirstInteract as any);
      window.removeEventListener("click", onFirstInteract as any);
      document.removeEventListener("visibilitychange", onVis);
      if (io) io.disconnect();
    };
  }, [threads.length]);

  const scrollBy = (dir: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".threads-card");
    const gap = 8;
    const amount = card ? card.offsetWidth + gap : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <div className="threads-wrap">
      <div className="flex items-center justify-between mb-2 px-1 gap-2">
        <h2 className="text-xs font-sans text-chassis-400 uppercase tracking-wider">Последние обновления</h2>
        <span className="text-sky-400 text-[10px]">Tina live ✓</span>
      </div>
      <div className="relative">
        <button
          type="button"
          aria-label="Прокрутить назад"
          onClick={() => scrollBy(-1)}
          disabled={atStart}
          className="hidden md:flex absolute left-1 lg:-left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-white hover:bg-black/85 transition shadow-lg disabled:opacity-30 disabled:pointer-events-none"
          style={{ display: needScroll ? undefined : "none" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <button
          type="button"
          aria-label="Прокрутить вперед"
          onClick={() => scrollBy(1)}
          disabled={atEnd}
          className="hidden md:flex absolute right-1 lg:-right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-white hover:bg-black/85 transition shadow-lg disabled:opacity-30 disabled:pointer-events-none"
          style={{ display: needScroll ? undefined : "none" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
        </button>
        <div ref={scrollerRef} className="threads-scroller flex gap-2 overflow-x-auto overflow-y-hidden pb-1 snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: "none" } as any}>
          {threads.map((node: any, idx: number) => {
            const dateIso = String(node.date).slice(0, 10);
            const dateLabel = formatThreadsDate(dateIso);
            const handle = node.handle ?? "laptopservice_uz";
            const gallery: string[] = node.gallery ?? [];
            const alts: string[] = node.alts ?? [];
            const postUrl = node.url ?? siteConfig.telegram.channelUrl;
            const videoUrl: string | undefined = node.video;
            const hasVideo = !!videoUrl;
            const posterUrl = hasVideo ? videoUrl.replace(/\.mp4$/, ".jpg") : undefined;
            const textForAlt = extractText(node.body);
            return (
              <a
                key={node.id ?? idx}
                href={postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="threads-card shrink-0 snap-start w-[260px] sm:w-[300px] bg-chassis-850 border border-chassis-800 rounded-[14px] overflow-hidden flex flex-col hover:border-chassis-700 hover:bg-chassis-800/60 transition-colors text-left no-underline"
                aria-label={`${handle} — ${textForAlt.slice(0, 60)}`}
              >
                <div className="flex items-start justify-between gap-2 p-2.5 pb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src="/logo.svg" alt="Laptop Service" width={24} height={24} className="w-6 h-6 rounded-full bg-chassis-900 border border-chassis-800 shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 leading-none">
                        <span className="text-xs font-bold text-chassis-100 leading-none" data-tina-field={tinaField(node, "handle")}>
                          {handle}
                        </span>
                        <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-sky-500 text-white text-[8px] leading-none shrink-0">✓</span>
                      </div>
                      <div className="text-[10px] text-chassis-500 font-sans leading-none mt-0.5">Laptop Service · Ташкент</div>
                    </div>
                  </div>
                  <time dateTime={dateIso} className="text-[11px] text-chassis-400 font-sans shrink-0 whitespace-nowrap leading-none mt-1" data-tina-field={tinaField(node, "date")}>
                    {dateLabel}
                  </time>
                </div>
                <div className="px-2.5 pb-1.5" data-tina-field={tinaField(node, "body")}>
                  <div className="text-xs text-chassis-200 leading-[1.4] whitespace-pre-wrap break-words line-clamp-3">
                    <TinaMarkdown content={node.body} />
                  </div>
                </div>
                {hasVideo ? (
                  <div className="px-2.5 pb-2.5" data-tina-field={tinaField(node, "video")}>
                    <div className="rounded-lg overflow-hidden border border-chassis-800 bg-chassis-900 relative aspect-video">
                      <video
                        src={videoUrl}
                        poster={posterUrl ?? gallery[0]}
                        autoPlay
                        muted
                        loop
                        playsInline
                        // @ts-ignore webkit legacy
                        webkit-playsinline="true"
                        x-webkit-airplay="deny"
                        // @ts-ignore
                        disablePictureInPicture
                        // @ts-ignore
                        disableRemotePlayback
                        preload="auto"
                        className="threads-video w-full h-full object-cover object-center bg-chassis-900 pointer-events-none"
                      />
                      <span className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 pointer-events-none">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.14v14l11-7z" /></svg> 0:05
                      </span>
                    </div>
                  </div>
                ) : gallery.length === 1 ? (
                  <div className="px-2.5 pb-2.5" data-tina-field={tinaField(node, "gallery")}>
                    <div className="rounded-lg overflow-hidden border border-chassis-800 bg-chassis-900 aspect-video">
                      <img src={gallery[0]} alt={alts[0] ?? textForAlt} className="w-full h-full object-cover object-center bg-chassis-900" loading="lazy" />
                    </div>
                  </div>
                ) : gallery.length > 1 ? (
                  <div className="px-2.5 pb-2.5" data-tina-field={tinaField(node, "gallery")}>
                    <div className="grid grid-cols-2 gap-1.5">
                      {gallery.map((src: string, i: number) => (
                        <div key={src} className="rounded-lg overflow-hidden border border-chassis-800 bg-chassis-900 aspect-square">
                          <img src={src} alt={alts[i] ?? textForAlt} className="w-full h-full object-cover object-center" loading="lazy" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
