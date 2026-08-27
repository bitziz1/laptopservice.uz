import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { siteConfig } from "@/data/siteConfig";

export const GET: APIRoute = async () => {
  const cases = await getCollection("cases");
  const builds = await getCollection("builds");
  const reviews = await getCollection("reviews");

  cases.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  builds.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  const casesList = cases
    .map((c, i) => {
const slug = (c.data as any).slug ?? c.id.replace(/\.md$/, "");
       return `${i + 1}. **${c.data.title}:** ${c.data.device} — ${c.data.category} — https://laptopservice.uz/cases/${slug}`;
    })
    .join("\n");

  const buildsList = builds
    .map((b, i) => {
      const slug = (b.data as any).slug ?? b.id.replace(/\.md$/, "");
      const comps = b.data.components
        ? Object.entries(b.data.components)
            .filter(([, v]) => v)
            .map(([k, v]) => `${k}: ${v}`)
            .join("; ")
        : "";
      return `${i + 1}. **${b.data.title}:** ${b.data.purposeLabel} — https://laptopservice.uz/builds/${slug}${comps ? ` — ${comps}` : ""}`;
    })
    .join("\n");

  const body = `# Laptop Service — Полный контекст для LLM-агентов

> Исчерпывающий контекст компании, мастерской, примеров работ, оборудования и регламентов взаимодействия для AI-агентов и поисковых систем. Сгенерировано при билде ${new Date().toISOString().slice(0, 10)}.

## 1. Паспорт сервисного центра
- **Название:** Laptop Service (бренд RemontNoutbukov)
- **Основной сайт:** https://laptopservice.uz
- **Дополнительный домен:** https://remontnoutbukov.uz
- **Телефон сервиса:** +998 (93) 228-77-38
- **Руководитель сервиса:** Руслан — +998 (90) 358-77-38, Telegram [@remontnoutbukov_uz](https://t.me/remontnoutbukov_uz) — строго по делу, контакты только на странице /contacts
- **Telegram сервиса:** https://t.me/laptopservice_master (@laptopservice_master)
- **Telegram канал (Source of Truth):** https://t.me/laptopservice_uz (@laptopservice_uz)
- **Telegram чат:** https://t.me/laptop_service_chat
- **Физический адрес:** Узбекистан, г. Ташкент, ул. Паркент, дом 11
- **Ориентиры:** Напротив центрального входа Паркентского базара, магазин «Радиодетали»
- **Координаты GPS:** 41.3155525 N, 69.322636 E
- **График работы:** Понедельник — Суббота с 09:00 до 19:00, Воскресенье по договоренности
- **Формат сдачи техники:** Личный визит в сервисный центр на ул. Паркент 11. Диагностика — бесплатно. Фиксируем акт приёма и контакты. На диагностику уходит время.

## 2. Принципы работы и ценообразования
- На сайте отсутствуют формы онлайн-заявок. Общение напрямую в Telegram или по телефону.
- Диагностика — **бесплатно**.
- Стоимость ремонта и запчастей **всегда** согласуется до начала работ.
- Никаких скрытых платежей. Профессиональные сборки ПК — сами обслуживаем и поддерживаем технику — новую и б/у.

## 3. Оборудование сервисного центра
- **BGA-пайка:** Инфракрасная паяльная станция
- **Оптика:** Стереомикроскоп для 0201 и 0.02мм
- **Диагностика:** Осциллограф, тепловизор, ЛБП
- **Программаторы:** RT809H, Vertyanov JIG v3
- **Расходники:** Honeywell PTM7950, Kester/Amtech, жидкий металл

## 4. Примеры работ (Наши работы) — ${cases.length} кейсов
${casesList}

*Даты показываются словами («12 августа 2026»), в разметке ISO YYYY-MM-DD.*

## 5. Сборки ПК — ${builds.length} сборок
${buildsList}

## 6. Отзывы — ${reviews.length} отзывов
Всего отзывов в коллекции: ${reviews.length}. Примеры: ${reviews
    .slice(0, 3)
    .map((r) => `${r.data.author} (${r.data.source})`)
    .join(", ")}.

## 7. Навигация сайта
- Главная (/) — сервис, порядок работы
- Услуги (/services) — не включается/греется/залит/петли
- Наши работы (/cases) — ${cases.length} реальных примеров
- Сборки ПК (/builds) — ${builds.length} сборок
- Диагностика и цены (/prices)
- Отзывы (/reviews) — ${reviews.length} отзывов
- Контакты (/contacts)

*Сгенерировано автоматически из content/cases, content/builds, content/reviews при билде. Сайт: ${siteConfig.url}*
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
