import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { siteConfig } from "@/data/siteConfig";
import { servicesData } from "@/data/services";

export const GET: APIRoute = async () => {
  const cases = await getCollection("cases");
  const builds = await getCollection("builds");

  cases.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  builds.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  const casesList = cases
    .map((c) => {
      const slug = c.id.split("/").pop()!.replace(/\.md$/, "");
      return `- [${c.data.title}](https://laptopservice.uz/cases/${slug}) — ${c.data.device} — ${c.data.category}`;
    })
    .join("\n");

  const buildsList = builds
    .map((b) => {
      const slug = b.id.split("/").pop()!.replace(/\.md$/, "");
      return `- [${b.data.title}](https://laptopservice.uz/builds/${slug}) — ${b.data.purposeLabel}`;
    })
    .join("\n");

  const servicesList = servicesData
    .map((s) => `- [${s.title}](https://laptopservice.uz/services/${s.slug}): ${s.shortDescription}`)
    .join("\n");

  const body = `# Laptop Service

> Сервисный центр по компонентному ремонту ноутбуков и компьютерной техники в Ташкенте — работаем с 2004 года. Бесплатная диагностика, акт приёма, согласование стоимости только после диагностики.

Laptop Service (также известный как RemontNoutbukov) — специализированный сервисный центр в Ташкенте (ул. Паркент 11, напротив Паркентского базара, магазин «Радиодетали»). Выполняем сложный аппаратный ремонт материнских плат: BGA-пайку видеочипов и процессоров, устранение коротких замыканий, ультразвуковую чистку и восстановление после залития, замену термоинтерфейсов на фазовый материал Honeywell PTM7950 и жидкий металл. Делаем профессиональные сборки ПК — знаем нюансы корпусов, охлаждения и питания, сами обслуживаем и поддерживаем технику.

## Ключевые правила взаимодействия
- **Приём техники:** Лично в сервисном центре (г. Ташкент, ул. Паркент 11). Диагностика — **бесплатно**. Фиксируем акт приёма и контакты — на диагностику уходит время.
- **Связь без посредников и форм на сайте:** Только напрямую через Telegram [@laptopservice_master](https://t.me/laptopservice_master) или по телефону [+998 (93) 228-77-38](tel:+998932287738). Руководитель сервиса Руслан — [+998 (90) 358-77-38](tel:+998903587738) [@remontnoutbukov_uz](https://t.me/remontnoutbukov_uz) — строго по делу, контакты только на странице контактов.
- **Прозрачное ценообразование:** Точная стоимость определяется только по результатам аппаратной диагностики и **всегда согласуется до начала ремонта**.
- **Официальный Telegram-канал:** [@laptopservice_uz](https://t.me/laptopservice_uz) — первоисточник с фотоотчётами, замерами и видео процесса ремонта.

## Основные разделы
- [Главная страница](https://laptopservice.uz/): Информация о сервисном центре, порядке работы (бесплатная диагностика, акт) и контактах.
- [Услуги сервисного центра](https://laptopservice.uz/services): Ноутбук не включается, перегревается, не заряжается, залит, сломаны петли — приезжайте, посмотрим и поможем.
${servicesList
      .split("\n")
      .map((l) => `  ${l}`)
      .join("\n")}
- [Наши работы](https://laptopservice.uz/cases): Реальные примеры из практики сервисного центра.
${casesList
      .split("\n")
      .map((l) => `  ${l}`)
      .join("\n")}
- [Сборки ПК](https://laptopservice.uz/builds): Профессиональные сборки от мастеров — знаем нюансы, сами обслуживаем, предупреждаем о рисках заранее.
${buildsList
      .split("\n")
      .map((l) => `  ${l}`)
      .join("\n")}
- [Цены](https://laptopservice.uz/prices): Бесплатная диагностика, порядок согласования стоимости.
- [Отзывы клиентов](https://laptopservice.uz/reviews): Реальные отзывы с Яндекс Карт и Google Maps. Оставить отзыв — на Яндекс Картах и Google Maps.
- [Контакты и схема проезда](https://laptopservice.uz/contacts): Адрес, Яндекс Карты / Google Maps, режим работы, руководитель сервиса.

## Картографические профили и соцсети
- [Яндекс Карты](https://yandex.com/maps/org/laptop_service/81659688745): Профиль организации Laptop Service, маршрут и отзывы.
- [Google Maps](https://maps.app.goo.gl/nhNuRttDTpXGpabW7): Локация сервисного центра на ул. Паркент 11.
- [Telegram-канал](https://t.me/laptopservice_uz): Ежедневные публикации из мастерской.
- [Telegram-чат](https://t.me/laptop_service_chat): Чат мастеров и обсуждения.
- [Instagram](https://www.instagram.com/laptopservice_uz): Фото и видео рабочего процесса.
- [Threads](https://www.threads.com/@laptopservice_uz): Лента работ и короткие заметки из сервиса.
- [Facebook](https://www.facebook.com/RemontNoutbukov.uz): Официальная страница в Facebook.

## Дополнительно
- [Полный машиночитаемый контекст компании](https://laptopservice.uz/llms-full.txt): Детальное описание для языковых моделей, включая примеры работ, параметры оборудования и регламенты.

*Сгенерировано при билде ${new Date().toISOString().slice(0, 10)} из ${cases.length} кейсов и ${builds.length} сборок. Сайт: ${siteConfig.url}*
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
