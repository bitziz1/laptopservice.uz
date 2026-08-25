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
    yandexMaps: string;
    googleMaps: string;
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
    description: "Прямой номер мастера для звонков и консультаций",
  },
  telegram: {
    channel: "@laptopservice_uz",
    channelUrl: "https://t.me/laptopservice_uz",
    chatUrl: "https://t.me/laptop_service_chat",
    masterUrl: "https://t.me/master77_service",
    masterHandle: "@master77_service",
  },
  socials: {
    instagram: "https://www.instagram.com/laptopservice_uz",
    facebook: "https://www.facebook.com/RemontNoutbukov.uz",
    yandexMaps: "https://yandex.com/maps/org/laptop_service/81659688745",
    googleMaps: "https://maps.app.goo.gl/nhNuRttDTpXGpabW7",
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