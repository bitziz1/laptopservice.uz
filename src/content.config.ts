import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Helper for image field - allow undefined for draft migration
// Astro provides `image()` via schema context: ({image}) => z.object({ cover: image() })

export const collections = {
  cases: defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./content/cases" }),
    schema: ({ image }) =>
      z.object({
        title: z.string(),
        device: z.string(),
        category: z.string(),
        date: z.coerce.date(),
        problem: z.string().optional(),
        diagnosis: z.string().optional(),
        solution: z.string().optional(),
        result: z.string().optional(),
        tags: z.array(z.string()).default([]),
        heroImage: image().optional(),
        gallery: z.array(image()).optional(),
        captions: z.array(z.string()).optional(),
        keySpecs: z
          .array(z.object({ label: z.string(), value: z.string() }))
          .optional(),
        schemaType: z.enum(["Article", "HowTo"]).default("HowTo"),
        summaryForSocial: z.string().optional(),
      }),
  }),

  builds: defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./content/builds" }),
    schema: ({ image }) =>
      z.object({
        title: z.string(),
        purpose: z.enum(["gaming", "ai-work", "office", "rendering"]),
        purposeLabel: z.string(),
        date: z.coerce.date(),
        description: z.string(),
        components: z
          .object({
            cpu: z.string().optional(),
            motherboard: z.string().optional(),
            ram: z.string().optional(),
            gpu: z.string().optional(),
            storage: z.string().optional(),
            psu: z.string().optional(),
            case: z.string().optional(),
            cooler: z.string().optional(),
          })
          .optional()
          .default({}),
        tags: z.array(z.string()).default([]),
        heroImage: image().optional(),
        gallery: z.array(image()).optional(),
      }),
  }),

  threads: defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./content/threads" }),
    schema: ({ image }) =>
      z.object({
        handle: z.string().default("laptopservice_uz"),
        date: z.coerce.date(),
        gallery: z.array(image()).optional(),
        alts: z.array(z.string()).optional(),
        url: z.string().url().optional(),
        video: z.string().optional(),
      }),
  }),

  reviews: defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./content/reviews" }),
    schema: ({ image }) =>
      z.object({
        author: z.string(),
        source: z
          .enum(["Яндекс Карты", "Google Maps", "2GIS", "remontnoutbukov.uz"])
          .default("Яндекс Карты"),
        rating: z.number().min(1).max(5).default(5),
        date: z.coerce.date(),
        device: z.string().default("Ноутбук"),
        avatar: image().optional(),
        gallery: z.array(image()).optional(),
        captions: z.array(z.string()).optional(),
      }),
  }),

  // Services — one folder per service: content/services/<slug>/<slug>.md + 1 photo + 1 video
  // Body (markdown) рендерится как HTML на странице (как в cases) — содержит симптомы/этапы/FAQ.
  // Prompts хранятся в frontmatter но не рендерятся в продакшене.
  // Фото/видео НЕ хранятся в md: источники это файлы content/services/<slug>/image.* и video.mp4 -> public/images|videos
  services: defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./content/services" }),
    schema: () =>
      z.object({
        title: z.string(),
        shortDescription: z.string(),
        fullDescription: z.string(),
        // Prompts co-located — single source, для 3 кнопок копирования в Tina (dev только). В проде не показывается.
        promptSubject: z.string().optional().nullable(),
        promptMotionA: z.string().optional().nullable(),
        promptMotionB: z.string().optional().nullable(),
        promptBucket: z.enum(["dark", "light"]).optional().nullable(),
        promptTone: z.string().optional().nullable(),
      }),
  }),
};
