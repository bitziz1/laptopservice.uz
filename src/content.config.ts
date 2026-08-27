import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Helper for image field - allow undefined for draft migration
// Astro provides `image()` via schema context: ({image}) => z.object({ cover: image() })

export const collections = {
  cases: defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./content/cases" }),
    schema: ({ image }) =>
      z.object({
        slug: z.string().optional(), // if not provided, use filename
        title: z.string(),
        device: z.string(),
        category: z.string(),
        date: z.coerce.date(),
        // allow body sections to hold problem/diagnosis/solution/result - keep frontmatter optional for simple Obsidian editing
        problem: z.string().optional(),
        diagnosis: z.string().optional(),
        solution: z.string().optional(),
        result: z.string().optional(),
        tags: z.array(z.string()).default([]),
        heroImage: image().optional(),
        gallery: z.array(image()).optional(),
        // legacy compatibility: old string paths
        images: z.array(z.string()).optional(),
        image: z.string().optional(),
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
        slug: z.string().optional(),
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
        // legacy
        images: z.array(z.string()).optional(),
      }),
  }),

  threads: defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./content/threads" }),
    schema: ({ image }) =>
      z.object({
        handle: z.string().default("laptopservice_uz"),
        date: z.coerce.date(),
        dateLabel: z.string().optional(),
        // images as ImageMetadata[] - original png/jpg colocated with md
        gallery: z.array(image()).optional(),
        // alt texts for gallery, same order
        alts: z.array(z.string()).optional(),
        media: z
          .array(
            z.object({
              image: image().optional(),
              src: z.string().optional(),
              alt: z.string().optional(),
            })
          )
          .optional(),
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
        // gallery for review photos
        gallery: z.array(image()).optional(),
        captions: z.array(z.string()).optional(),
        // legacy photos array with src strings
        photos: z
          .array(z.object({ src: z.string().optional(), caption: z.string().optional() }))
          .optional(),
      }),
  }),
};
