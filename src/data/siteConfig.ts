export interface SiteConfig {
  siteName: string;
  brandName: string;
  legalName: string;
  domain: string;
  redirectDomain: string;
  url: string;
  masterName: string;
  masterExperienceYears: number;
  contactPerson: string;
  phones: {
    primary: string;
    displayPrimary: string;
    description: string;
  };
  manager: {
    name: string;
    phone: string;
    displayPhone: string;
    telegram: string;
    telegramUrl: string;
  };
  telegram: {
    channel: string;
    channelUrl: string;
    chatUrl: string;
    masterUrl: string;
    masterHandle: string;
  };
  socials: {
    instagram: string;
    facebook: string;
    threads: string;
    yandexMaps: string;
    googleMaps: string;
    twoGis: string;
  };
  address: {
    country: string;
    city: string;
    street: string;
    landmark: string;
    fullAddress: string;
    deliveryInfo: string;
    geo: {
      latitude: number;
      longitude: number;
    };
  };
  workingHours: {
    days: string;
    hours: string;
    sunday: string;
  };
  policy: {
    priceAgreedBeforeRepair: boolean;
    diagnosticsExplanation: string;
  };
}

export const siteConfig: SiteConfig = {
  siteName: "Laptop Service — Ремонт ноутбуков в Ташкенте",
  brandName: "Laptop Service",
  legalName: "Laptop Service Tashkent",
  domain: "laptopservice.uz",
  redirectDomain: "remontnoutbukov.uz",
  url: "https://laptopservice.uz",
  masterName: "Руслан",
  masterExperienceYears: 20,
  contactPerson: "Мастер",
  phones: {
    primary: "+998932287738",
    displayPrimary: "+998 (93) 228-77-38",
    description: "Прямой номер для звонков и консультаций",
  },
  manager: {
    name: "Руслан",
    phone: "+998903587738",
    displayPhone: "+998 (90) 358-77-38",
    telegram: "@remontnoutbukov_uz",
    telegramUrl: "tg://resolve?domain=remontnoutbukov_uz",
  },
  telegram: {
    channel: "@laptopservice_uz",
    channelUrl: "tg://resolve?domain=laptopservice_uz",
    chatUrl: "tg://resolve?domain=laptop_service_chat",
    masterUrl: "tg://resolve?domain=laptopservice_master",
    masterHandle: "@laptopservice_master",
  },
  socials: {
    instagram: "https://www.instagram.com/laptopservice_uz",
    facebook: "https://www.facebook.com/RemontNoutbukov.uz",
    threads: "https://www.threads.com/@laptopservice_uz",
    yandexMaps: "https://yandex.com/maps/org/laptop_service/81659688745",
    googleMaps: "https://maps.app.goo.gl/nhNuRttDTpXGpabW7",
    twoGis: "https://go.2gis.com/UQ0XA",
  },
  address: {
    country: "Узбекистан",
    city: "г. Ташкент",
    street: "ул. Паркент 11",
    landmark: "напротив Паркентского базара, внутри магазина «Радиодетали»",
    fullAddress: "г. Ташкент, ул. Паркент, д. 11 (напротив Паркентского базара, внутри магазина «Радиодетали»)",
    deliveryInfo: "Принимаем технику лично в мастерской или через сервис доставки (Яндекс Доставка / курьер)",
    geo: {
      latitude: 41.3144,
      longitude: 69.3148,
    },
  },
  workingHours: {
    days: "Понедельник — Суббота",
    hours: "09:00 — 19:00",
    sunday: "Воскресенье — по договоренности",
  },
  policy: {
    priceAgreedBeforeRepair: true,
    diagnosticsExplanation: "Точная стоимость определяется после диагностики и ВСЕГДА согласовывается с клиентом до начала любых платных работ.",
  },
};