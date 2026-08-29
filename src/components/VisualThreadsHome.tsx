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
  // sort by date desc (tina returns unsorted)
  threads.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="threads-wrap">
      <div className="flex items-center justify-between mb-2 px-1 gap-2">
        <h2 className="text-xs font-sans text-chassis-400 uppercase tracking-wider">Последние обновления</h2>
        <span className="text-sky-400 text-[10px]">Tina live ✓</span>
      </div>
      <div className="threads-scroller flex gap-2 overflow-x-auto overflow-y-hidden pb-1 snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0">
        {threads.map((node: any, idx: number) => {
          const dateIso = String(node.date).slice(0, 10);
          const dateLabel = formatThreadsDate(dateIso);
          const handle = node.handle ?? "laptopservice_uz";
          const gallery: string[] = node.gallery ?? [];
          const alts: string[] = node.alts ?? [];
          const postUrl = node.url ?? siteConfig.telegram.channelUrl;
          // body is rich-text JSON
          const textForAlt = extractText(node.body);
          return (
            <article
              key={node.id ?? idx}
              className="threads-card shrink-0 snap-start w-[260px] sm:w-[300px] bg-chassis-850 border border-chassis-800 rounded-[14px] overflow-hidden flex flex-col cursor-pointer hover:border-chassis-700 hover:bg-chassis-800/60 transition-colors"
              data-tina-field={tinaField(node, "body")}
            >
              <div className="flex items-center gap-2 p-2.5 pb-1.5">
                <img src="/logo.svg" alt="Laptop Service" width={24} height={24} className="w-6 h-6 rounded-full bg-chassis-900 border border-chassis-800 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 flex-wrap leading-none">
                    <span className="text-xs font-bold text-chassis-100 leading-none" data-tina-field={tinaField(node, "handle")}>
                      {handle}
                    </span>
                    <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-sky-500 text-white text-[8px] leading-none">✓</span>
                    <span className="text-chassis-500 text-[11px]">·</span>
                    <time dateTime={dateIso} className="text-[11px] text-chassis-400 font-sans" data-tina-field={tinaField(node, "date")}>
                      {dateLabel}
                    </time>
                  </div>
                  <div className="text-[10px] text-chassis-500 font-sans leading-none mt-0.5">Laptop Service · Ташкент</div>
                </div>
              </div>
              <div className="px-2.5 pb-1.5" data-tina-field={tinaField(node, "body")}>
                <div className="text-xs text-chassis-200 leading-[1.4] whitespace-pre-wrap break-words line-clamp-3">
                  <TinaMarkdown content={node.body} />
                </div>
              </div>
              {gallery.length === 1 ? (
                <div className="px-2.5 pb-2.5" data-tina-field={tinaField(node, "gallery")}>
                  <div className="rounded-lg overflow-hidden border border-chassis-800 bg-chassis-900">
                    <img src={gallery[0]} alt={alts[0] ?? textForAlt} className="w-full h-[148px] object-cover bg-chassis-900" loading="lazy" />
                  </div>
                </div>
              ) : gallery.length > 1 ? (
                <div className="px-2.5 pb-2.5" data-tina-field={tinaField(node, "gallery")}>
                  <div className="grid grid-cols-2 gap-1.5">
                    {gallery.map((src: string, i: number) => (
                      <div key={src} className="rounded-lg overflow-hidden border border-chassis-800 bg-chassis-900">
                        <img src={src} alt={alts[i] ?? textForAlt} className="w-full h-[110px] object-cover" loading="lazy" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              <a href={postUrl} target="_blank" rel="noopener noreferrer" className="sr-only">
                {postUrl}
              </a>
            </article>
          );
        })}
      </div>
    </div>
  );
}
