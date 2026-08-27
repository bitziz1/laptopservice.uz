import { OGImageRoute } from 'astro-og-canvas';
import { getCollection } from 'astro:content';
import { servicesData } from '@/data/services';

// Brand color from user: rgb(25,189,155) = #19BD9B
const brandBg: [number, number, number] = [25, 189, 155];

// Build pages dictionary - keys become /og/<key>.png
const staticPages: Record<string, { title: string; description: string }> = {
  'index': {
    title: 'Laptop Service — Ремонт ноутбуков в Ташкенте',
    description: 'Сервисный центр на ул. Паркент 11. Компонентный ремонт плат, BGA-пайка, чистка, восстановление после залития. С 2004 года.',
  },
  'about': {
    title: 'О сервисном центре Laptop Service',
    description: 'Мастерская на Паркент 11: микроскопы, BGA-станция, осциллографы. С 2004 года.',
  },
  'services': {
    title: 'Услуги ремонта ноутбуков',
    description: 'Компонентный ремонт, BGA-пайка, чистка, залитие. Паркент 11.',
  },
  'builds': {
    title: 'Сборки ПК под задачу',
    description: 'Игровые, AI-станции RTX 4090, офисные. Подбор в Ташкенте.',
  },
  'cases': {
    title: 'Наши работы — примеры ремонтов',
    description: 'Реальные кейсы: BGA, залитие, петли, питание. Фото и разбор.',
  },
  'contacts': {
    title: 'Контакты — Laptop Service Ташкент',
    description: 'ул. Паркент 11, +998 (93) 228-77-38 · Telegram @laptopservice_master',
  },
  'prices': {
    title: 'Диагностика и цены',
    description: 'Бесплатная диагностика, согласование стоимости до ремонта.',
  },
  'reviews': {
    title: 'Отзывы клиентов Laptop Service',
    description: 'Реальные отзывы с Яндекс Карт и Google Maps.',
  },
};

// Dynamic service pages
for (const s of servicesData) {
  staticPages[`services/${s.slug}`] = {
    title: s.title,
    description: s.shortDescription?.slice(0, 120) ?? s.title,
  };
}
// Dynamic builds — из content/builds/*.md (Obsidian)
const buildsEntries = await getCollection("builds");
for (const b of buildsEntries) {
  const slug = (b.data as any).slug ?? b.id.replace(/\.md$/, "");
  staticPages[`builds/${slug}`] = {
    title: b.data.title,
    description: b.data.description.slice(0, 120),
  };
}
// Dynamic cases — из content/cases/*.md (Obsidian)
const casesEntries = await getCollection("cases");
for (const c of casesEntries) {
  const slug = (c.data as any).slug ?? c.id.replace(/\.md$/, "");
  const problem = (c.data as any).problem ?? "";
  staticPages[`cases/${slug}`] = {
    title: c.data.title,
    description: problem.slice(0, 120) || c.body?.slice(0, 120) || c.data.title,
  };
}

export const { getStaticPaths, GET } = await OGImageRoute({
  pages: staticPages,
  getImageOptions: (path, page) => ({
    title: page.title,
    description: page.description,
    // Solid brand background
    bgGradient: [brandBg],
    // Minimalistic white logotype on brand bg - logo-og.png is white LS on transparent (512x512), blends with #19BD9B
    logo: {
      path: './public/logo-og.png',
      size: [140, 140],
    },
    // Minimalistic padding
    padding: 60,
    // White text on brand bg
    font: {
      title: {
        color: [255, 255, 255],
        size: 56,
        lineHeight: 1.1,
        weight: 'Bold',
        families: ['DejaVu Sans'],
      },
      description: {
        color: [255, 255, 255],
        size: 28,
        lineHeight: 1.35,
        weight: 'Normal',
        families: ['DejaVu Sans'],
      },
    },
    // Local fonts supporting latin, cyrillic, numbers, symbols, emoji fallback - not shipped to client, build-time only
    fonts: [
      './src/assets/fonts/DejaVuSans.ttf',
      './src/assets/fonts/DejaVuSans-Bold.ttf',
    ],
    // Border accent subtle white
    border: {
      color: [255, 255, 255],
      width: 0,
      side: 'block-start',
    },
  }),
});
