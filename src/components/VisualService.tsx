import { useTina, tinaField } from "tinacms/dist/react";
import { TinaMarkdown } from "tinacms/dist/rich-text";

export default function VisualService(props: { query: string; variables: any; data: any }) {
  const { data } = useTina(props);
  const s: any = data.services;

  // media теперь только из public (прозрачные), исходники в content не используются на сайте
  return (
    <div className="space-y-10">

      <header className="space-y-4">
        <div className="text-xs font-sans text-chassis-400 uppercase tracking-wider flex flex-wrap gap-2 items-center">
          <span className="text-sky-400 text-[10px]">Tina live ✓</span>
        </div>

        <h1
          className="text-2xl sm:text-4xl font-extrabold text-chassis-100 tracking-tight leading-tight"
          data-tina-field={tinaField(s, "title")}
        >
          {s.title}
        </h1>

        <p
          className="text-sm sm:text-base text-chassis-300 leading-relaxed"
          data-tina-field={tinaField(s, "fullDescription")}
        >
          {s.fullDescription}
        </p>
        <p
          className="text-xs text-chassis-400 leading-relaxed"
          data-tina-field={tinaField(s, "shortDescription")}
        >
          {s.shortDescription}
        </p>
      </header>

      {/* Prompts — only visible in Tina live (dev), so editor can click to edit + copy via sidebar */}
      {(s.promptSubject || s.promptMotionA || s.promptMotionB) && (
        <div className="rounded-lg border border-dashed border-chassis-700 bg-chassis-950/50 p-3 space-y-2">
          <div className="text-[10px] font-bold text-chassis-400 uppercase tracking-wider">
            Промпты (видно только в Tina — скопируйте через кнопку в сайдбаре)
          </div>
          {s.promptSubject && (
            <div className="text-xs text-chassis-300" data-tina-field={tinaField(s, "promptSubject")}>
              <span className="font-bold text-chassis-200">SUBJECT:</span> {s.promptSubject}
            </div>
          )}
          {s.promptMotionA && (
            <div className="text-xs text-chassis-300" data-tina-field={tinaField(s, "promptMotionA")}>
              <span className="font-bold text-chassis-200">MOTION A:</span> {s.promptMotionA}
            </div>
          )}
          {s.promptMotionB && (
            <div className="text-xs text-chassis-300" data-tina-field={tinaField(s, "promptMotionB")}>
              <span className="font-bold text-chassis-200">MOTION B:</span> {s.promptMotionB}
            </div>
          )}
          <div className="flex gap-4 text-[10px] text-chassis-500">
            {s.promptBucket && (
              <span data-tina-field={tinaField(s, "promptBucket")}>Бакет: {s.promptBucket}</span>
            )}
            {s.promptTone && (
              <span data-tina-field={tinaField(s, "promptTone")}>Тон: {s.promptTone}</span>
            )}
          </div>
        </div>
      )}

      <article
        className="prose prose-invert prose-sm max-w-none prose-headings:font-bold prose-headings:text-chassis-100 prose-p:text-chassis-300 prose-li:text-chassis-300 prose-strong:text-chassis-100 prose-a:text-sky-400 hover:prose-a:text-sky-300"
        data-tina-field={tinaField(s, "body")}
      >
        <TinaMarkdown content={s.body} />
      </article>
    </div>
  );
}
