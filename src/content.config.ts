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
        complexity: z.enum(["easy", "medium", "hard"]).default("medium"),
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
};
