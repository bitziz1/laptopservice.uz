import { defineConfig } from "tinacms";

const branch = process.env.HEAD || process.env.GITHUB_REF_NAME || "master";

export default defineConfig({
  branch,
  clientId: null, // local-only, no Tina Cloud
  token: null,

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },

  media: {
    tina: {
      mediaRoot: "content",
      publicFolder: "",
    },
  },

  schema: {
    collections: [
      {
        name: "builds",
        label: "Сборки",
        path: "content/builds",
        format: "md",
        ui: {
          router: ({ document }) => `/builds/${document._sys.filename}`,
        },
        fields: [
          { type: "string", name: "title", label: "Название", isTitle: true, required: true },
          {
            type: "string",
            name: "purpose",
            label: "Назначение",
            options: [
              { value: "gaming", label: "🎮 Игровой" },
              { value: "ai-work", label: "🤖 AI / Нейросети" },
              { value: "office", label: "💼 Офисный" },
              { value: "rendering", label: "🎬 Рендеринг" },
            ],
            required: true,
          },
          { type: "string", name: "purposeLabel", label: "Подпись назначения", required: true },
          { type: "datetime", name: "date", label: "Дата", required: true },
          {
            type: "string",
            name: "description",
            label: "Описание (для карточки/SEO)",
            ui: { component: "textarea" },
            required: true,
          },

          {
            type: "object",
            name: "components",
            label: "Комплектующие",
            fields: [
              { type: "string", name: "cpu", label: "🧠 Процессор" },
              { type: "string", name: "motherboard", label: "🔌 Материнская плата" },
              { type: "string", name: "ram", label: "💾 Оперативная память" },
              { type: "string", name: "gpu", label: "🎮 Видеокарта" },
              { type: "string", name: "storage", label: "💽 Накопитель" },
              { type: "string", name: "psu", label: "⚡ Блок питания" },
              { type: "string", name: "case", label: "🖥 Корпус" },
              { type: "string", name: "cooler", label: "❄️ Охлаждение" },
            ],
          },

          {
            type: "string",
            name: "complexity",
            label: "Сложность",
            options: [
              { value: "easy", label: "🟢 Просто" },
              { value: "medium", label: "🟡 Средне" },
              { value: "hard", label: "🔴 Сложно" },
            ],
          },

          { type: "string", name: "tags", label: "Теги", list: true },

          { type: "image", name: "heroImage", label: "Обложка (hero)" },
          { type: "image", name: "gallery", label: "Галерея", list: true },

          { type: "rich-text", name: "body", label: "Текст сборки", isBody: true },
        ],
      },
      {
        name: "cases",
        label: "Кейсы",
        path: "content/cases",
        format: "md",
        ui: {
          router: ({ document }) => `/cases/${document._sys.filename}`,
        },
        fields: [
          { type: "string", name: "title", label: "Заголовок", isTitle: true, required: true },
          { type: "string", name: "device", label: "Устройство", required: true },
          { type: "string", name: "category", label: "Категория", required: true, options: [
            { value: "Компонентный ремонт платы", label: "Компонентный ремонт" },
            { value: "BGA-пайка и реболлинг", label: "BGA-пайка" },
            { value: "Восстановление после залития", label: "После залития" },
            { value: "Ремонт петель и корпуса", label: "Петли/корпус" },
            { value: "Профилактика и охлаждение", label: "Профилактика" },
            { value: "Прошивка BIOS / EC", label: "BIOS/EC" },
            { value: "Разъемы и пайка", label: "Разъемы" },
            { value: "Диагностика", label: "Диагностика" },
          ]},
          { type: "datetime", name: "date", label: "Дата", required: true },
          { type: "string", name: "problem", label: "Проблема (frontmatter, optional)", ui: { component: "textarea" } },
          { type: "string", name: "diagnosis", label: "Диагностика", ui: { component: "textarea" } },
          { type: "string", name: "solution", label: "Решение", ui: { component: "textarea" } },
          { type: "string", name: "result", label: "Результат", ui: { component: "textarea" } },
          { type: "string", name: "tags", label: "Теги", list: true },
          { type: "image", name: "heroImage", label: "Обложка" },
          { type: "image", name: "gallery", label: "Галерея", list: true },
          {
            type: "object",
            name: "keySpecs",
            label: "Характеристики",
            list: true,
            fields: [
              { type: "string", name: "label", label: "Параметр" },
              { type: "string", name: "value", label: "Значение" },
            ],
          },
          { type: "string", name: "schemaType", label: "Schema", options: [{ value: "HowTo", label: "HowTo" }, { value: "Article", label: "Article" }] },
          { type: "string", name: "summaryForSocial", label: "Опис. для соцсетей", ui: { component: "textarea" } },
          { type: "string", name: "slug", label: "Слаг (опц.)" },
          { type: "rich-text", name: "body", label: "Тело (## Проблема и т.д.)", isBody: true },
        ],
      },
      {
        name: "threads",
        label: "Лента",
        path: "content/threads",
        format: "md",
        ui: {
          router: ({ document }) => `/`,
        },
        fields: [
          { type: "string", name: "handle", label: "Хэндл", required: false },
          { type: "datetime", name: "date", label: "Дата", required: true },
          { type: "string", name: "dateLabel", label: "Подпись даты" },
          { type: "image", name: "gallery", label: "Галерея", list: true },
          { type: "string", name: "alts", label: "Alt-тексты", list: true, description: "1:1 к gallery" },
          { type: "rich-text", name: "body", label: "Текст поста", isBody: true },
        ],
      },
      {
        name: "reviews",
        label: "Отзывы",
        path: "content/reviews",
        format: "md",
        ui: {
          router: ({ document }) => `/reviews`,
        },
        fields: [
          { type: "string", name: "author", label: "Автор", isTitle: true, required: true },
          {
            type: "string",
            name: "source",
            label: "Источник",
            options: [
              { value: "Яндекс Карты", label: "Яндекс Карты" },
              { value: "Google Maps", label: "Google Maps" },
              { value: "2GIS", label: "2GIS" },
              { value: "remontnoutbukov.uz", label: "remontnoutbukov.uz" },
            ],
          },
          { type: "number", name: "rating", label: "Рейтинг 1-5" },
          { type: "datetime", name: "date", label: "Дата", required: true },
          { type: "string", name: "device", label: "Устройство" },
          { type: "image", name: "avatar", label: "Аватар" },
          { type: "image", name: "gallery", label: "Галерея", list: true },
          { type: "string", name: "captions", label: "Подписи", list: true, description: "1:1 к gallery" },
          { type: "rich-text", name: "body", label: "Текст отзыва", isBody: true },
        ],
      },
    ],
  },
});
