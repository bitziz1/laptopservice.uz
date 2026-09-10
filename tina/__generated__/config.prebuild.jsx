// tina/config.ts
import { defineConfig } from "tinacms";

// tina/components/CopyField.tsx
import React from "react";
var MASTER_IMAGE = `3D rendered icon in a clean modern tech-repair style, glossy plastic and brushed matte-graphite materials, the subject is lit by soft diffused studio lighting with realistic highlights and shadow, single accent color #19BD9B (teal-green) used for glowing highlights, energy lines, LED indicators and screen glow, neutral grey and dark graphite base materials, isometric 3/4 perspective, centered composition, no text, no logos, no watermarks.

BACKGROUND: {bg}

single centered object, physically based rendering, high detail, sharp focus on thin structures (fan blades, pins, cables, hinges), neutral reflections only, playful sticker-like appeal similar to 3D emoji icon packs, crisp clean edges, subtle soft contact shadow directly under the object, product-render quality, 4k

SUBJECT: {subject}

Negative prompt: colored background, green background, chroma key, gradient background, vignette, color spill, green reflection, extra objects, hands, people, text, watermark`;
var MASTER_VIDEO = `Seamless perfectly looping 4-second animation of the reference image, 24fps, 640x640, camera locked and completely static, no camera movement, no camera shake.

{MOTION}

Natural physics with realistic weight, momentum and secondary motion, smooth non-linear easing (ease-in / ease-out, not constant speed), loop point matches the first frame exactly so playback repeats infinitely with no visible seam or jump, teal (#19BD9B) glow pulses softly and rhythmically in sync with the motion, playful sticker-like appeal, background stays exactly as in the reference image (flat, unlit, no gradient), no new elements entering or leaving the frame.

MOTION: {motion}`;
var BG_DARK = "plain uncluttered dark charcoal studio background (#171A20), evenly lit, minimal shadow, subject clearly separated from background, no other objects in frame, no gradient, no vignette, no color spill from the subject onto the background.";
var BG_LIGHT = "plain uncluttered light grey studio background (#D1D5DB), evenly lit, minimal shadow, subject clearly separated from background, no other objects in frame, no gradient, no vignette, no color spill from the subject onto the background.";
function CopyField(props) {
  const { input, field, form } = props;
  const [copied, setCopied] = React.useState(false);
  const text = input?.value || "";
  const label = field.name === "promptSubject" ? "\u041A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043F\u0440\u043E\u043C\u043F\u0442 \u0444\u043E\u0442\u043E" : field.name === "promptMotionA" ? "\u041A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043F\u0440\u043E\u043C\u043F\u0442 \u0432\u0438\u0434\u0435\u043E A" : field.name === "promptMotionB" ? "\u041A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043F\u0440\u043E\u043C\u043F\u0442 \u0432\u0438\u0434\u0435\u043E B" : "\u041A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C";
  const getBucket = () => {
    try {
      const vals = form?.getState?.()?.values ?? form?.values ?? {};
      return vals?.promptBucket ?? "dark";
    } catch {
      return "dark";
    }
  };
  const buildFullPrompt = () => {
    if (!text) return "";
    if (field.name === "promptSubject") {
      const bucket = getBucket();
      const bg = bucket === "light" ? BG_LIGHT : BG_DARK;
      return MASTER_IMAGE.replace("{bg}", bg).replace("{subject}", text);
    }
    if (field.name === "promptMotionA" || field.name === "promptMotionB") {
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
    } catch {
    }
  };
  return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, React.createElement("span", { style: { fontSize: 12, fontWeight: 600 } }, field.label), React.createElement(
    "button",
    {
      type: "button",
      onClick: doCopy,
      style: {
        padding: "4px 10px",
        borderRadius: 6,
        border: "1px solid #d1d5db",
        background: copied ? "#ecfdf5" : "#f9fafb",
        fontSize: 12,
        cursor: "pointer"
      }
    },
    copied ? "\u2713 \u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u043E" : label
  )), React.createElement(
    "textarea",
    {
      ...input,
      rows: 4,
      style: { width: "100%", padding: 8, borderRadius: 6, border: "1px solid #d1d5db", fontFamily: "monospace", fontSize: 12 }
    }
  ), field.description && React.createElement("span", { style: { fontSize: 11, color: "#6b7280" } }, field.description));
}

// tina/config.ts
var branch = process.env.HEAD || process.env.GITHUB_REF_NAME || "master";
var slugify = (str) => str.toString().toLowerCase().replace(/[а-яё]/g, (char) => {
  const map = {
    \u0430: "a",
    \u0431: "b",
    \u0432: "v",
    \u0433: "g",
    \u0434: "d",
    \u0435: "e",
    \u0451: "yo",
    \u0436: "zh",
    \u0437: "z",
    \u0438: "i",
    \u0439: "y",
    \u043A: "k",
    \u043B: "l",
    \u043C: "m",
    \u043D: "n",
    \u043E: "o",
    \u043F: "p",
    \u0440: "r",
    \u0441: "s",
    \u0442: "t",
    \u0443: "u",
    \u0444: "f",
    \u0445: "h",
    \u0446: "ts",
    \u0447: "ch",
    \u0448: "sh",
    \u0449: "sch",
    \u044A: "",
    \u044B: "y",
    \u044C: "",
    \u044D: "e",
    \u044E: "yu",
    \u044F: "ya"
  };
  return map[char] ?? char;
}).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/--+/g, "-").slice(0, 80) || "untitled";
var MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
var dateSuffix = (dateVal) => {
  if (!dateVal) return "";
  if (typeof dateVal === "string") {
    const raw = dateVal.trim();
    if (/^\d{4}$/.test(raw)) return `-${raw}`;
    if (/^\d{4}-\d{2}$/.test(raw)) {
      const [y, m] = raw.split("-");
      const idx = parseInt(m, 10) - 1;
      if (idx >= 0 && idx < 12) return `-${MONTHS[idx]}${y}`;
    }
  }
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const mon = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `-${day}${mon}${year}`;
};
var MONTHS_PATTERN = MONTHS.join("|");
var stripDateSuffix = (s) => {
  const reFull = new RegExp(`-\\d{2}(?:${MONTHS_PATTERN})\\d{4}$`, "i");
  const reMonth = new RegExp(`-(?:${MONTHS_PATTERN})\\d{4}$`, "i");
  return s.replace(reFull, "").replace(reMonth, "").replace(/-\d{4}$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "");
};
var filenameSlugify = (values, fallback) => {
  const src = values?.title ?? values?.author ?? values?.handle ?? fallback;
  if (!src || typeof src !== "string") return fallback;
  const s = slugify(src);
  const clean = stripDateSuffix(s);
  const suffix = dateSuffix(values?.date);
  return (clean || fallback) + suffix;
};
var config_default = defineConfig({
  branch,
  clientId: null,
  // local-only, no Tina Cloud
  token: null,
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  media: {
    tina: {
      mediaRoot: "content",
      publicFolder: ""
    }
  },
  schema: {
    collections: [
      {
        name: "builds",
        label: "\u0421\u0431\u043E\u0440\u043A\u0438",
        path: "content/builds",
        format: "md",
        ui: {
          router: ({ document: document2 }) => `/builds/${document2._sys.filename}`,
          filename: {
            // slug = title + -DDmmmYYYY (-04aug2026 / -aug2026 / -2026)
            slugify: (values) => filenameSlugify(values, "novaya-sborka")
          }
        },
        fields: [
          { type: "string", name: "title", label: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435", isTitle: true, required: true },
          {
            type: "string",
            name: "purpose",
            label: "\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435",
            options: [
              { value: "gaming", label: "\u{1F3AE} \u0418\u0433\u0440\u043E\u0432\u043E\u0439" },
              { value: "ai-work", label: "\u{1F916} AI / \u041D\u0435\u0439\u0440\u043E\u0441\u0435\u0442\u0438" },
              { value: "office", label: "\u{1F4BC} \u041E\u0444\u0438\u0441\u043D\u044B\u0439" },
              { value: "rendering", label: "\u{1F3AC} \u0420\u0435\u043D\u0434\u0435\u0440\u0438\u043D\u0433" }
            ],
            required: true
          },
          { type: "string", name: "purposeLabel", label: "\u041F\u043E\u0434\u043F\u0438\u0441\u044C \u043D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F", required: true },
          { type: "datetime", name: "date", label: "\u0414\u0430\u0442\u0430", required: true },
          {
            type: "string",
            name: "description",
            label: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 (\u0434\u043B\u044F \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0438/SEO)",
            ui: { component: "textarea" },
            required: true
          },
          {
            type: "object",
            name: "components",
            label: "\u041A\u043E\u043C\u043F\u043B\u0435\u043A\u0442\u0443\u044E\u0449\u0438\u0435",
            fields: [
              { type: "string", name: "cpu", label: "\u{1F9E0} \u041F\u0440\u043E\u0446\u0435\u0441\u0441\u043E\u0440" },
              { type: "string", name: "motherboard", label: "\u{1F50C} \u041C\u0430\u0442\u0435\u0440\u0438\u043D\u0441\u043A\u0430\u044F \u043F\u043B\u0430\u0442\u0430" },
              { type: "string", name: "ram", label: "\u{1F4BE} \u041E\u043F\u0435\u0440\u0430\u0442\u0438\u0432\u043D\u0430\u044F \u043F\u0430\u043C\u044F\u0442\u044C" },
              { type: "string", name: "gpu", label: "\u{1F3AE} \u0412\u0438\u0434\u0435\u043E\u043A\u0430\u0440\u0442\u0430" },
              { type: "string", name: "storage", label: "\u{1F4BD} \u041D\u0430\u043A\u043E\u043F\u0438\u0442\u0435\u043B\u044C" },
              { type: "string", name: "psu", label: "\u26A1 \u0411\u043B\u043E\u043A \u043F\u0438\u0442\u0430\u043D\u0438\u044F" },
              { type: "string", name: "case", label: "\u{1F5A5} \u041A\u043E\u0440\u043F\u0443\u0441" },
              { type: "string", name: "cooler", label: "\u2744\uFE0F \u041E\u0445\u043B\u0430\u0436\u0434\u0435\u043D\u0438\u0435" }
            ]
          },
          { type: "string", name: "tags", label: "\u0422\u0435\u0433\u0438", list: true },
          { type: "image", name: "heroImage", label: "\u041E\u0431\u043B\u043E\u0436\u043A\u0430 (hero)" },
          { type: "image", name: "gallery", label: "\u0413\u0430\u043B\u0435\u0440\u0435\u044F", list: true },
          { type: "rich-text", name: "body", label: "\u0422\u0435\u043A\u0441\u0442 \u0441\u0431\u043E\u0440\u043A\u0438", isBody: true }
        ]
      },
      {
        name: "cases",
        label: "\u041A\u0435\u0439\u0441\u044B",
        path: "content/cases",
        format: "md",
        ui: {
          router: ({ document: document2 }) => `/cases/${document2._sys.filename}`,
          filename: {
            // slug = title + -DDmmmYYYY
            slugify: (values) => filenameSlugify(values, "novyi-keys")
          }
        },
        fields: [
          { type: "string", name: "title", label: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A", isTitle: true, required: true },
          { type: "string", name: "device", label: "\u0423\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u043E", required: true },
          {
            type: "string",
            name: "category",
            label: "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F",
            required: true,
            options: [
              { value: "\u041A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u043D\u044B\u0439 \u0440\u0435\u043C\u043E\u043D\u0442 \u043F\u043B\u0430\u0442\u044B", label: "\u041A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u043D\u044B\u0439 \u0440\u0435\u043C\u043E\u043D\u0442" },
              { value: "BGA-\u043F\u0430\u0439\u043A\u0430 \u0438 \u0440\u0435\u0431\u043E\u043B\u043B\u0438\u043D\u0433", label: "BGA-\u043F\u0430\u0439\u043A\u0430" },
              { value: "\u0412\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u043F\u043E\u0441\u043B\u0435 \u0437\u0430\u043B\u0438\u0442\u0438\u044F", label: "\u041F\u043E\u0441\u043B\u0435 \u0437\u0430\u043B\u0438\u0442\u0438\u044F" },
              { value: "\u0420\u0435\u043C\u043E\u043D\u0442 \u043F\u0435\u0442\u0435\u043B\u044C \u0438 \u043A\u043E\u0440\u043F\u0443\u0441\u0430", label: "\u041F\u0435\u0442\u043B\u0438/\u043A\u043E\u0440\u043F\u0443\u0441" },
              { value: "\u041F\u0440\u043E\u0444\u0438\u043B\u0430\u043A\u0442\u0438\u043A\u0430 \u0438 \u043E\u0445\u043B\u0430\u0436\u0434\u0435\u043D\u0438\u0435", label: "\u041F\u0440\u043E\u0444\u0438\u043B\u0430\u043A\u0442\u0438\u043A\u0430" },
              { value: "\u041F\u0440\u043E\u0448\u0438\u0432\u043A\u0430 BIOS / EC", label: "BIOS/EC" },
              { value: "\u0420\u0430\u0437\u044A\u0435\u043C\u044B \u0438 \u043F\u0430\u0439\u043A\u0430", label: "\u0420\u0430\u0437\u044A\u0435\u043C\u044B" },
              { value: "\u0414\u0438\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u043A\u0430", label: "\u0414\u0438\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u043A\u0430" }
            ]
          },
          { type: "datetime", name: "date", label: "\u0414\u0430\u0442\u0430", required: true },
          { type: "string", name: "problem", label: "\u041F\u0440\u043E\u0431\u043B\u0435\u043C\u0430 (frontmatter, optional)", ui: { component: "textarea" } },
          { type: "string", name: "diagnosis", label: "\u0414\u0438\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u043A\u0430", ui: { component: "textarea" } },
          { type: "string", name: "solution", label: "\u0420\u0435\u0448\u0435\u043D\u0438\u0435", ui: { component: "textarea" } },
          { type: "string", name: "result", label: "\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442", ui: { component: "textarea" } },
          { type: "string", name: "tags", label: "\u0422\u0435\u0433\u0438", list: true },
          { type: "image", name: "heroImage", label: "\u041E\u0431\u043B\u043E\u0436\u043A\u0430" },
          { type: "image", name: "gallery", label: "\u0413\u0430\u043B\u0435\u0440\u0435\u044F", list: true },
          { type: "string", name: "captions", label: "\u041F\u043E\u0434\u043F\u0438\u0441\u0438 \u043A \u0444\u043E\u0442\u043E", list: true, description: "1:1 \u043A gallery (\u043F\u043E\u0434\u043F\u0438\u0441\u044C \u043F\u043E\u0434 \u043A\u0430\u0436\u0434\u044B\u043C \u0444\u043E\u0442\u043E \u0432 \u043A\u0430\u0440\u0443\u0441\u0435\u043B\u0438)" },
          {
            type: "object",
            name: "keySpecs",
            label: "\u0425\u0430\u0440\u0430\u043A\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043A\u0438",
            list: true,
            fields: [
              { type: "string", name: "label", label: "\u041F\u0430\u0440\u0430\u043C\u0435\u0442\u0440" },
              { type: "string", name: "value", label: "\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435" }
            ]
          },
          { type: "string", name: "schemaType", label: "Schema", options: [{ value: "HowTo", label: "HowTo" }, { value: "Article", label: "Article" }] },
          { type: "string", name: "summaryForSocial", label: "\u041E\u043F\u0438\u0441. \u0434\u043B\u044F \u0441\u043E\u0446\u0441\u0435\u0442\u0435\u0439", ui: { component: "textarea" } },
          { type: "rich-text", name: "body", label: "\u0422\u0435\u043B\u043E (## \u041F\u0440\u043E\u0431\u043B\u0435\u043C\u0430 \u0438 \u0442.\u0434.)", isBody: true }
        ]
      },
      {
        name: "threads",
        label: "\u041B\u0435\u043D\u0442\u0430",
        path: "content/threads",
        format: "md",
        ui: {
          router: () => `/`,
          filename: {
            // slug = handle/body-base + -DDmmmYYYY (suffix, not prefix)
            slugify: (values) => {
              const suffix = dateSuffix(values?.date) || dateSuffix(/* @__PURE__ */ new Date());
              const extractText = (body) => {
                if (!body) return "";
                if (typeof body === "string") return body;
                if (Array.isArray(body)) {
                  const texts = [];
                  for (const node of body) {
                    if (node?.children) {
                      for (const child of node.children) {
                        if (child?.text) texts.push(child.text);
                      }
                    } else if (node?.text) texts.push(node.text);
                  }
                  return texts.join(" ");
                }
                return "";
              };
              let raw = extractText(values?.body).slice(0, 80).trim();
              const handleSlug = values?.handle ? slugify(values.handle) : "";
              const isGenericHandle = handleSlug === "laptopservice-uz" || handleSlug === "laptopservice-uz";
              if (!raw) {
                if (handleSlug && !isGenericHandle) raw = values.handle;
                else raw = "post";
              }
              const s = slugify(raw);
              const clean = stripDateSuffix(s) || "post";
              let base = clean === "laptopservice-uz" ? "post" : clean;
              if (base === "post" && raw === "post") {
                base = "post";
              }
              return base + suffix;
            }
          }
        },
        fields: [
          { type: "string", name: "handle", label: "\u0425\u044D\u043D\u0434\u043B", required: false },
          { type: "datetime", name: "date", label: "\u0414\u0430\u0442\u0430", required: true },
          { type: "image", name: "gallery", label: "\u0413\u0430\u043B\u0435\u0440\u0435\u044F", list: true },
          { type: "string", name: "alts", label: "Alt-\u0442\u0435\u043A\u0441\u0442\u044B", list: true, description: "1:1 \u043A gallery" },
          { type: "string", name: "url", label: "\u0421\u0441\u044B\u043B\u043A\u0430 \u043D\u0430 \u043F\u0443\u0431\u043B\u0438\u043A\u0430\u0446\u0438\u044E", description: "\u041A\u043D\u043E\u043F\u043A\u0430 \xAB\u041F\u0443\u0431\u043B\u0438\u043A\u0430\u0446\u0438\u044F\xBB \u0432\u0435\u0434\u0451\u0442 \u0441\u044E\u0434\u0430, \u0435\u0441\u043B\u0438 \u043F\u0443\u0441\u0442\u043E \u2014 \u0432 Telegram" },
          { type: "string", name: "video", label: "\u0412\u0438\u0434\u0435\u043E (mp4)", description: "\u041F\u0443\u0442\u044C \u043A \u0432\u0438\u0434\u0435\u043E \u0432 /content/threads/...mp4 (\u043E\u043F\u0442\u0438\u043C\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u043D\u043E ffmpeg, muted autoplay). \u041E\u0441\u0442\u0430\u0432\u044C \u043F\u0443\u0441\u0442\u044B\u043C \u0435\u0441\u043B\u0438 \u0442\u043E\u043B\u044C\u043A\u043E \u0444\u043E\u0442\u043E." },
          { type: "rich-text", name: "body", label: "\u0422\u0435\u043A\u0441\u0442 \u043F\u043E\u0441\u0442\u0430", isBody: true }
        ]
      },
      {
        name: "reviews",
        label: "\u041E\u0442\u0437\u044B\u0432\u044B",
        path: "content/reviews",
        format: "md",
        ui: {
          router: () => `/reviews`,
          filename: {
            // slug = rev-author + -DDmmmYYYY
            slugify: (values) => {
              const src = values?.author ?? "novyi-otzyv";
              const s = slugify(src);
              const base = s.startsWith("rev-") ? s : `rev-${s}`;
              const clean = stripDateSuffix(base);
              const suffix = dateSuffix(values?.date);
              return clean + suffix;
            }
          }
        },
        fields: [
          { type: "string", name: "author", label: "\u0410\u0432\u0442\u043E\u0440", isTitle: true, required: true },
          {
            type: "string",
            name: "source",
            label: "\u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A",
            options: [
              { value: "\u042F\u043D\u0434\u0435\u043A\u0441 \u041A\u0430\u0440\u0442\u044B", label: "\u042F\u043D\u0434\u0435\u043A\u0441 \u041A\u0430\u0440\u0442\u044B" },
              { value: "Google Maps", label: "Google Maps" },
              { value: "2GIS", label: "2GIS" },
              { value: "remontnoutbukov.uz", label: "remontnoutbukov.uz" }
            ]
          },
          { type: "number", name: "rating", label: "\u0420\u0435\u0439\u0442\u0438\u043D\u0433 1-5" },
          { type: "datetime", name: "date", label: "\u0414\u0430\u0442\u0430", required: true },
          { type: "string", name: "device", label: "\u0423\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u043E" },
          { type: "image", name: "avatar", label: "\u0410\u0432\u0430\u0442\u0430\u0440" },
          { type: "image", name: "gallery", label: "\u0413\u0430\u043B\u0435\u0440\u0435\u044F", list: true },
          { type: "string", name: "captions", label: "\u041F\u043E\u0434\u043F\u0438\u0441\u0438", list: true, description: "1:1 \u043A gallery" },
          { type: "rich-text", name: "body", label: "\u0422\u0435\u043A\u0441\u0442 \u043E\u0442\u0437\u044B\u0432\u0430", isBody: true }
        ]
      },
      {
        name: "services",
        label: "\u0423\u0441\u043B\u0443\u0433\u0438",
        path: "content/services",
        format: "md",
        ui: {
          router: ({ document: document2 }) => {
            const fn = document2._sys?.filename || "";
            const slug = fn.includes("/") ? fn.split("/").pop() : fn;
            return `/services/${slug}`;
          },
          filename: {
            // One service = one folder: content/services/<slug>/<slug>.md
            // Tina creates via slugify returning "slug/slug" (folder + file)
            slugify: (values) => {
              const src = values?.title ?? "novaya-usluga";
              const s = slugify(src);
              const base = stripDateSuffix(s) || "novaya-usluga";
              return `${base}/${base}`;
            }
          }
        },
        fields: [
          { type: "string", name: "title", label: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A \u0443\u0441\u043B\u0443\u0433\u0438", isTitle: true, required: true },
          { type: "string", name: "shortDescription", label: "\u041A\u043E\u0440\u043E\u0442\u043A\u043E\u0435 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 (\u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0430/SEO)", ui: { component: "textarea" }, required: true },
          { type: "string", name: "fullDescription", label: "\u041F\u043E\u043B\u043D\u043E\u0435 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 (\u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0430)", ui: { component: "textarea" }, required: true },
          // Media — файлы НЕ хранятся в md: источники это content/services/<slug>/image.png|jpg и video.mp4
          // ingest сканирует папку и генерит public/images|videos/services/<slug>.webp|mp4 (прозрачные, без фона)
          // Prompts — с кнопками копирования (всегда видны, даже если heroImage/video заполнены)
          { type: "string", name: "promptSubject", label: "\u041F\u0440\u043E\u043C\u043F\u0442 \u2014 SUBJECT (\u0444\u043E\u0442\u043E)", ui: { component: CopyField }, description: "SUBJECT \u0438\u0437 guide-final-v2.md \xA74. \u041A\u043D\u043E\u043F\u043A\u0430 \u0441\u043A\u043E\u043F\u0438\u0440\u0443\u0435\u0442 \u043F\u043E\u043B\u043D\u044B\u0439 \u043F\u0440\u043E\u043C\u043F\u0442 \u0444\u043E\u0442\u043E." },
          { type: "string", name: "promptMotionA", label: "\u041F\u0440\u043E\u043C\u043F\u0442 \u2014 MOTION A (\u0432\u0438\u0434\u0435\u043E \u0431\u0430\u0437\u043E\u0432\u044B\u0439)", ui: { component: CopyField }, description: "MOTION A \u2014 \u0441\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u044B\u0439 loop." },
          { type: "string", name: "promptMotionB", label: "\u041F\u0440\u043E\u043C\u043F\u0442 \u2014 MOTION B (\u0432\u0438\u0434\u0435\u043E \u0432\u0438\u0440\u0430\u043B\u044C\u043D\u044B\u0439)", ui: { component: CopyField }, description: "MOTION B \u2014 anticipation/overshoot." },
          {
            type: "string",
            name: "promptBucket",
            label: "\u0411\u0430\u043A\u0435\u0442 \u0444\u043E\u043D\u0430",
            description: "dark=#171A20 (\u0441\u0432\u0435\u0442\u043B\u044B\u0439 \u043E\u0431\u044A\u0435\u043A\u0442) / light=#D1D5DB (\u0442\u0451\u043C\u043D\u044B\u0439 \u043E\u0431\u044A\u0435\u043A\u0442) \u2014 \u0441\u043C. guide \xA73",
            options: [
              { value: "dark", label: "\u0422\u0451\u043C\u043D\u044B\u0439 #171A20" },
              { value: "light", label: "\u0421\u0432\u0435\u0442\u043B\u044B\u0439 #D1D5DB" }
            ]
          },
          { type: "string", name: "promptTone", label: "\u0422\u043E\u043D \u043E\u0431\u044A\u0435\u043A\u0442\u0430 (\u0441\u0432\u0435\u0442\u043B\u044B\u0439/\u0442\u0451\u043C\u043D\u044B\u0439/\u0441\u043C\u0435\u0448\u0430\u043D\u043D\u044B\u0439)", description: "\u0414\u043B\u044F \u0432\u044B\u0431\u043E\u0440\u0430 \u0431\u0430\u043A\u0435\u0442\u0430" },
          { type: "rich-text", name: "body", label: "\u0422\u0435\u043B\u043E \u2014 \u0441\u0438\u043C\u043F\u0442\u043E\u043C\u044B/\u044D\u0442\u0430\u043F\u044B/FAQ (\u043A\u0430\u043A \u0432 cases)", isBody: true, description: "\u041F\u0438\u0448\u0438\u0442\u0435 ## \u0425\u0430\u0440\u0430\u043A\u0442\u0435\u0440\u043D\u044B\u0435 \u043F\u0440\u0438\u0437\u043D\u0430\u043A\u0438 / ## \u041F\u043E\u0440\u044F\u0434\u043E\u043A \u043F\u0440\u043E\u0432\u0435\u0434\u0435\u043D\u0438\u044F \u0440\u0430\u0431\u043E\u0442 / ## \u0427\u0430\u0441\u0442\u044B\u0435 \u0432\u043E\u043F\u0440\u043E\u0441\u044B \u2014 \u0440\u0435\u043D\u0434\u0435\u0440\u0438\u0442\u0441\u044F \u0432 HTML \u043D\u0430 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0435 \u0443\u0441\u043B\u0443\u0433\u0438." }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
