export interface ThreadItem {
  id: string;
  handle: string;
  author: string;
  date: string; // ISO YYYY-MM-DD
  dateLabel: string; // display e.g. "16 июня 2026"
  text: string;
  media: {
    src: string;
    srcSet?: string;
    poster?: string;
    alt: string;
    width?: number;
    height?: number;
    type: "image";
  }[];
}

export const threadsData: ThreadItem[] = [
  {
    id: "thread-01",
    handle: "laptopservice_uz",
    author: "Laptop Service",
    date: "2026-06-16",
    dateLabel: "16 июня 2026",
    text: "Лето конечно хорошо, но про свои ноутбуки тоже не надо забывать 😉\nК нам на обслуживание и ремонт зашел Asus ROG Strix Scar 17 на Ryzen 9 и RTX 3080, ноутбук не обслуживали с момента покупки, в связи с чем вышла из строя система питания. Мы все восстановили и провели тщательную чистку всего ноутбука, отмыли каждый участок ноутбука 🙂",
    media: [
      {
        src: "/media/threads/01-before-after-360.webp",
        srcSet: "/media/threads/01-before-after-360.webp 720w, /media/threads/01-before-after-720.webp 1080w",
        alt: "Asus ROG Strix Scar 17 — до и после чистки и восстановления системы питания",
        type: "image",
        width: 720,
        height: 900,
      },
    ],
  },
  {
    id: "thread-02",
    handle: "laptopservice_uz",
    author: "Laptop Service",
    date: "2026-01-29",
    dateLabel: "29 января 2026",
    text: "Вот так выглядит правильный термоинтерфейс для игровых ноутбуков. 😎",
    media: [
      {
        src: "/media/threads/02-termo-01-360.webp",
        alt: "Правильный термоинтерфейс для игровых ноутбуков — нанесение Honeywell",
        type: "image",
        width: 720,
        height: 720,
      },
      {
        src: "/media/threads/02-termo-02-360.webp",
        alt: "Правильный термоинтерфейс для игровых ноутбуков — результат",
        type: "image",
        width: 720,
        height: 720,
      },
    ],
  },
  {
    id: "thread-03",
    handle: "laptopservice_uz",
    author: "Laptop Service",
    date: "2026-06-16",
    dateLabel: "16 июня 2026",
    text: "А кулера мы не просто продуваем от пыли, а идеально отмываем до заводского состояния 😊",
    media: [
      {
        src: "/media/threads/03-cooler-360.webp",
        srcSet: "/media/threads/03-cooler-360.webp 720w, /media/threads/03-cooler-720.webp 1080w",
        alt: "Кулер ноутбука отмыт до заводского состояния",
        type: "image",
        width: 720,
        height: 540,
      },
    ],
  },
  {
    id: "thread-04",
    handle: "laptopservice_uz",
    author: "Laptop Service",
    date: "2026-08-26",
    dateLabel: "26 августа 2026",
    text: "Принесли залитый сладким чаем ноутбук. До этого лежал несколько дней в другой мастерской без внимания. Клиентка выбрала нас, и мы приступили к делу сразу же — на фото вручную вычищаем дорожки, чтобы ноутбук зажил новой жизнью! ✨",
    media: [
      {
        src: "/media/threads/photo_2026-08-26_16-57-10-360.webp",
        srcSet: "/media/threads/photo_2026-08-26_16-57-10-360.webp 360w, /media/threads/photo_2026-08-26_16-57-10-720.webp 720w",
        alt: "Вручную вычищаем дорожки платы залитого сладким чаем ноутбука",
        type: "image",
        width: 720,
        height: 571,
      },
    ],
  },
];
