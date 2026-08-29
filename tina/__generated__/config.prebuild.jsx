// tina/config.ts
import { defineConfig } from "tinacms";
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
          router: ({ document }) => `/builds/${document._sys.filename}`,
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
          {
            type: "string",
            name: "complexity",
            label: "\u0421\u043B\u043E\u0436\u043D\u043E\u0441\u0442\u044C",
            options: [
              { value: "easy", label: "\u{1F7E2} \u041F\u0440\u043E\u0441\u0442\u043E" },
              { value: "medium", label: "\u{1F7E1} \u0421\u0440\u0435\u0434\u043D\u0435" },
              { value: "hard", label: "\u{1F534} \u0421\u043B\u043E\u0436\u043D\u043E" }
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
          router: ({ document }) => `/cases/${document._sys.filename}`,
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
      }
    ]
  }
});
export {
  config_default as default
};
