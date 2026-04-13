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
  linkUrl: z.string().url().optional().nullable().or(z.literal("")),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  // PORT-05 enrichment
  badge: z.string().max(100).optional().nullable(),
  title: z.string().max(200).optional().nullable(),
  subtitle: z.string().max(200).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  ctaText: z.string().max(100).optional().nullable(),
  ctaUrl: z.string().url().optional().nullable().or(z.literal("")),
  reserveUrl: z.string().url().optional().nullable().or(z.literal("")),
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
  type: z.enum(["text", "image", "gallery", "video", "html", "hero", "cta", "faq"]),
  content: z.record(z.unknown()).default({}),
  sortOrder: z.number().int().min(0).default(0),
});
export const updatePageBlockSchema = createPageBlockSchema.partial();

// ==================== GALLERY ITEMS ====================

export const createGalleryItemSchema = z.object({
  imageUrl: z.string().url().min(1),
  fileKey: z.string().optional().nullable(),
  title: z.string().max(200).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});
export const updateGalleryItemSchema = createGalleryItemSchema.partial();

export const reorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

// ==================== MEDIA FILES ====================

export const createMediaFileSchema = z.object({
  filename: z.string().min(1).max(500),
  originalName: z.string().min(1).max(500),
  url: z.string().url().min(1),
  fileKey: z.string().optional().nullable(),
  mimeType: z.string().min(1).max(100),
  size: z.number().int().min(0).optional().nullable(),
  type: z.enum(["image", "video", "document"]).default("image"),
  altText: z.string().max(500).optional().nullable(),
});

// ==================== HOME MODULE ITEMS ====================

export const createHomeModuleItemSchema = z.object({
  moduleKey: z.enum(["featured", "popular", "seasonal"]),
  productId: z.string().min(1),
  sortOrder: z.number().int().min(0).default(0),
});

// ==================== BLOCK TYPE CONTENT SCHEMAS ====================

export const heroBlockContentSchema = z.object({
  heading: z.string().min(1).max(200),
  subheading: z.string().max(500).optional(),
  backgroundUrl: z.string().url().optional(),
  ctaText: z.string().max(100).optional(),
  ctaUrl: z.string().url().optional(),
});

export const ctaBlockContentSchema = z.object({
  heading: z.string().min(1).max(200),
  body: z.string().max(2000).optional(),
  ctaText: z.string().min(1).max(100),
  ctaUrl: z.string().url().min(1),
  variant: z.enum(["primary", "secondary", "outline"]).default("primary"),
});

export const faqBlockContentSchema = z.object({
  items: z.array(z.object({
    question: z.string().min(1).max(500),
    answer: z.string().min(1).max(5000),
  })).min(1),
});
