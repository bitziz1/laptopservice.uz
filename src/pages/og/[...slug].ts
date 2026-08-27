import { OGImageRoute } from 'astro-og-canvas';
import { servicesData } from '@/data/services';
import { buildsData } from '@/data/builds';
import { casesData } from '@/data/cases';

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
// Dynamic builds
for (const b of buildsData) {
  staticPages[`builds/${b.slug}`] = {
    title: b.title,
    description: b.description.slice(0, 120),
  };
}
// Dynamic cases
for (const c of casesData) {
  staticPages[`cases/${c.slug}`] = {
    title: c.title,
    description: c.problem.slice(0, 120),
  };
}

export const { getStaticPaths, GET } = await OGImageRoute({
  pages: staticPages,
  getImageOptions: (path, page) => ({
    title: page.title,
    description: page.description,
    // Solid brand background
    bgGradient: [brandBg],
    // Logo centered top - existing logo.svg has #19bd9b square + white logotype, blending with brand bg for minimalistic white logotype
    logo: {
      path: './public/logo.svg',
      size: [180, 180],
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
        families: ['Noto Sans'],
      },
      description: {
        color: [255, 255, 255],
        size: 28,
        lineHeight: 1.35,
        weight: 'Normal',
        families: ['Noto Sans'],
      },
    },
    // Cyrillic-capable fonts (remote, fetched at build time, not shipped to client)
    fonts: [
      'https://api.fontsource.org/v1/fonts/noto-sans/cyrillic-700-normal.ttf',
      'https://api.fontsource.org/v1/fonts/noto-sans/cyrillic-400-normal.ttf',
    ],
    // Border accent subtle white
    border: {
      color: [255, 255, 255],
      width: 0,
      side: 'block-start',
    },
  }),
});
