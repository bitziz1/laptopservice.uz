export type BuildPurpose = "gaming" | "ai-work" | "office" | "rendering";

export type BuildComplexity = "easy" | "medium" | "hard";

export interface BuildItem {
  id: string;
  slug: string;
  title: string;
  purpose: BuildPurpose;
  purposeLabel: string;
  date: string;
  description: string;
  components: {
    cpu?: string;
    motherboard?: string;
    ram?: string;
    gpu?: string;
    psu?: string;
    case?: string;
    cooler?: string;
    storage?: string;
  };
  complexity: BuildComplexity;
  sourceUrl: string;
  images: string[];
  tags: string[];
}

export const buildComplexityConfig: Record<BuildComplexity, { label: string; class: string }> = {
  easy: { label: "Легкая сборка", class: "text-chassis-300" },
  medium: { label: "Стандартная сборка", class: "text-chassis-300" },
  hard: { label: "Комплексная сборка", class: "text-chassis-300" },
};

export const buildsData: BuildItem[] = [
  {
    id: "build-01",
    slug: "gaming-1080p-rtx4060-r5-5600",
    title: "Оптимальная сборка для игр в Full HD — RTX 4060 + Ryzen 5 5600",
    purpose: "gaming",
    purposeLabel: "Игры (Full HD / 144 Гц)",
    date: "2026-08-10",
    description:
      "Сбалансированная сборка для современных игр в 1080p на ультра-настройках (60–144 FPS) без переплаты. Подобрана под стабильный FPS в Cyberpunk 2077, Dota 2, CS2 и Hogwarts Legacy. Все комплектующие в наличии в Ташкенте.",
    components: {
      cpu: "AMD Ryzen 5 5600 (6 ядер / 12 потоков, до 4.4 ГГц)",
      motherboard: "MSI B550M PRO-VDH WIFI (mATX, M.2 PCIe 4.0)",
      ram: "32 GB DDR4 3200 МГц (2×16 GB Kingston Fury Beast)",
      gpu: "NVIDIA GeForce RTX 4060 8GB (Gigabyte Windforce OC)",
      storage: "1 TB NVMe PCIe 4.0 (Samsung 980 Pro / Kingston KC3000)",
      psu: "650W 80+ Bronze (DeepCool PM650D Gold)",
      case: "DeepCool Matrexx 40 3FS (mATX, 3 вентилятора)",
      cooler: "DeepCool AG400 (башенный, 4 теплотрубки)",
    },
    complexity: "medium",
    sourceUrl: "https://t.me/laptopservice_uz",
    images: [],
    tags: ["RTX 4060", "Ryzen 5", "Full HD", "Игры", "Сборка ПК"],
  },
  {
    id: "build-02",
    slug: "ai-workstation-rtx4090-r9-7950x",
    title: "Рабочая станция для AI / 3D-рендера — RTX 4090 + Ryzen 9 7950X",
    purpose: "ai-work",
    purposeLabel: "AI, нейросети и 3D-рендер",
    date: "2026-08-04",
    description:
      "Высокопроизводительная станция для локального запуска LLM (Llama 3, Qwen), Stable Diffusion XL и рендера в Blender/Cinema 4D. 24 ГБ видеопамяти RTX 4090 позволяют держать модели до 30B параметров в VRAM. Система охлаждения рассчитана на длительную нагрузку.",
    components: {
      cpu: "AMD Ryzen 9 7950X (16 ядер / 32 потока, до 5.7 ГГц)",
      motherboard: "ASUS ROG Strix X670E-E Gaming WiFi (ATX, PCIe 5.0)",
      ram: "64 GB DDR5 5600 МГц (2×32 GB G.Skill Trident Z5)",
      gpu: "NVIDIA GeForce RTX 4090 24GB (ASUS TUF Gaming OC)",
      storage: "2 TB NVMe PCIe 4.0 (Samsung 990 Pro) + 4 TB SATA SSD",
      psu: "1000W 80+ Gold ATX 3.0 (Corsair RM1000e, PCIe 5.0 12VHPWR)",
      case: "Fractal Design Meshify 2 XL (Full-Tower, продуваемый)",
      cooler: "Arctic Liquid Freezer III 360 (СЖО 360 мм)",
    },
    complexity: "hard",
    sourceUrl: "https://t.me/laptopservice_uz",
    images: [],
    tags: ["RTX 4090", "Ryzen 9", "AI", "Stable Diffusion", "Blender"],
  },
  {
    id: "build-03",
    slug: "office-compact-i5-12400-uhd730",
    title: "Компактная офисная сборка — Core i5-12400 (UHD 730) без дискретной GPU",
    purpose: "office",
    purposeLabel: "Офис и учёба",
    date: "2026-07-22",
    description:
      "Тихая и энергоэффективная сборка для офиса, бухгалтерии и учёбы. Встроенной графики UHD 730 достаточно для 4K-видео, Zoom и лёгких задач. Корпус компактный, на столе занимает минимум места.",
    components: {
      cpu: "Intel Core i5-12400 (6 ядер / 12 потоков, UHD Graphics 730)",
      motherboard: "Gigabyte B660M DS3H DDR4 (mATX, M.2)",
      ram: "16 GB DDR4 3200 МГц (2×8 GB)",
      gpu: "Встроенная Intel UHD Graphics 730",
      storage: "512 GB NVMe PCIe 3.0 (Kingston NV2)",
      psu: "500W 80+ Bronze (FSP HV Pro 550W)",
      case: "Jonsbo C6 (Mini-Tower, компактный)",
      cooler: "Боксовый кулер Intel Laminar RM1 (в комплекте CPU)",
    },
    complexity: "easy",
    sourceUrl: "https://t.me/laptopservice_uz",
    images: [],
    tags: ["Office", "Core i5", "Компактный ПК", "Бухгалтерия"],
  },
];
