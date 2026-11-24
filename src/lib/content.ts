import { z } from "zod";

export const blogSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens"),
  title: z.string().trim().min(3).max(160),
  excerpt: z.string().trim().min(10).max(300),
  tag: z.string().trim().min(2).max(40),
  category: z.enum(["AWARENESS", "NEWS"]),
  coverImage: z.string().trim().min(1),
  coverAlt: z.string().trim().min(3).max(160),
  body: z.string().min(20),
  published: z.boolean().default(true),
  publishedAt: z.coerce.date().optional(),
});

export const noticeSchema = z
  .object({
    title: z.string().trim().min(3).max(200),
    category: z.enum(["NEWSLETTER", "GUIDELINES", "CHARGES", "UPDATES"]),
    fileUrl: z.string().trim().url().optional().or(z.literal("")),
    body: z.string().trim().optional(),
    publishedAt: z.coerce.date().optional(),
  })
  .refine((v) => v.fileUrl || v.body, "Add a file link or some text");
