import { z } from "zod";

// ==================== SITE SETTINGS ====================

export const upsertSiteSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.record(z.unknown()).default({}),
});
export type UpsertSiteSetting = z.infer<typeof upsertSiteSettingSchema>;

// ==================== SLIDESHOW ITEMS ====================

export const createSlideshowItemSchema = z.object({
  imageUrl: z.string().url().min(1),
  caption: z.string().max(500).optional().nullable(),
  linkUrl: z.string().url().optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});
export const updateSlideshowItemSchema = createSlideshowItemSchema.partial();

// ==================== CMS MENU ITEMS ====================

export const createCmsMenuItemSchema = z.object({
  label: z.string().min(1).max(200),
  url: z.string().min(1).max(500),
  position: z.enum(["header", "footer"]).default("header"),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});
export const updateCmsMenuItemSchema = createCmsMenuItemSchema.partial();

// ==================== STATIC PAGES ====================

export const createStaticPageSchema = z.object({
  title: z.string().min(1).max(300),
  slug: z.string().min(1).max(300).regex(/^[a-z0-9-]+$/).optional(),
  content: z.string().default(""),
  metaDescription: z.string().max(500).optional().nullable(),
  isPublished: z.boolean().default(false),
});
export const updateStaticPageSchema = createStaticPageSchema.partial();

// ==================== PAGE BLOCKS ====================

export const createPageBlockSchema = z.object({
  type: z.enum(["text", "image", "gallery", "video", "html"]),
  content: z.record(z.unknown()).default({}),
  sortOrder: z.number().int().min(0).default(0),
});
export const updatePageBlockSchema = createPageBlockSchema.partial();
