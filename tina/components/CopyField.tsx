import React from "react";

const MASTER_IMAGE = `3D rendered icon in a clean modern tech-repair style, glossy plastic and brushed matte-graphite materials, the subject is lit by soft diffused studio lighting with realistic highlights and shadow, single accent color #19BD9B (teal-green) used for glowing highlights, energy lines, LED indicators and screen glow, neutral grey and dark graphite base materials, isometric 3/4 perspective, centered composition, no text, no logos, no watermarks.

BACKGROUND: {bg}

single centered object, physically based rendering, high detail, sharp focus on thin structures (fan blades, pins, cables, hinges), neutral reflections only, playful sticker-like appeal similar to 3D emoji icon packs, crisp clean edges, subtle soft contact shadow directly under the object, product-render quality, 4k

SUBJECT: {subject}

Negative prompt: colored background, green background, chroma key, gradient background, vignette, color spill, green reflection, extra objects, hands, people, text, watermark`;
const MASTER_VIDEO = `Seamless perfectly looping 4-second animation of the reference image, 24fps, 640x640, camera locked and completely static, no camera movement, no camera shake.

{MOTION}

Natural physics with realistic weight, momentum and secondary motion, smooth non-linear easing (ease-in / ease-out, not constant speed), loop point matches the first frame exactly so playback repeats infinitely with no visible seam or jump, teal (#19BD9B) glow pulses softly and rhythmically in sync with the motion, playful sticker-like appeal, background stays exactly as in the reference image (flat, unlit, no gradient), no new elements entering or leaving the frame.

MOTION: {motion}`;
const BG_DARK = "plain uncluttered dark charcoal studio background (#171A20), evenly lit, minimal shadow, subject clearly separated from background, no other objects in frame, no gradient, no vignette, no color spill from the subject onto the background.";
const BG_LIGHT = "plain uncluttered light grey studio background (#D1D5DB), evenly lit, minimal shadow, subject clearly separated from background, no other objects in frame, no gradient, no vignette, no color spill from the subject onto the background.";

export default function CopyField(props: any) {
  const { input, field, form } = props;
  const [copied, setCopied] = React.useState(false);
  const text = input?.value || "";
  const label =
    field.name === "promptSubject"
      ? "Копировать промпт фото"
      : field.name === "promptMotionA"
        ? "Копировать промпт видео A"
        : field.name === "promptMotionB"
          ? "Копировать промпт видео B"
          : "Копировать";

  const getBucket = (): string => {
    try {
      const vals = (form as any)?.getState?.()?.values ?? (form as any)?.values ?? {};
      return vals?.promptBucket ?? "dark";
    } catch {
      return "dark";
    }
  };

  const buildFullPrompt = (): string => {
    if (!text) return "";
    if (field.name === "promptSubject") {
      const bucket = getBucket();
      const bg = bucket === "light" ? BG_LIGHT : BG_DARK;
      return MASTER_IMAGE.replace("{bg}", bg).replace("{subject}", text);
    }
    if (field.name === "promptMotionA" || field.name === "promptMotionB") {
      // MASTER_VIDEO has {MOTION} and {motion} — replace all
      return MASTER_VIDEO.split("{MOTION}").join(text).split("{motion}").join(text);
    }
    return text;
  };

  const doCopy = async () => {
    try {
      const v = buildFullPrompt() || text || "";
      if (!v) return;
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(v);
      } else {
        const ta = document.createElement("textarea");
        ta.value = v;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 600 }}>{field.label}</span>
        <button
          type="button"
          onClick={doCopy}
          style={{
            padding: "4px 10px",
            borderRadius: 6,
            border: "1px solid #d1d5db",
            background: copied ? "#ecfdf5" : "#f9fafb",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          {copied ? "✓ Скопировано" : label}
        </button>
      </div>
      <textarea
        {...input}
        rows={4}
        style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #d1d5db", fontFamily: "monospace", fontSize: 12 }}
      />
      {field.description && <span style={{ fontSize: 11, color: "#6b7280" }}>{field.description}</span>}
    </div>
  );
}
