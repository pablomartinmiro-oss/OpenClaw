import { z } from "zod";

// ==================== REVIEW ====================

export const createReviewSchema = z.object({
  entityType: z.enum(["experience", "hotel", "spa", "restaurant"]),
  entityId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  authorName: z.string().min(1).max(200),
  authorEmail: z.string().email().optional().nullable(),
  title: z.string().max(200).optional().nullable(),
  body: z.string().min(1).max(5000),
  stayDate: z.coerce.date().optional().nullable(),
  status: z
    .enum(["pending", "approved", "rejected"])
    .default("pending"),
});

export const updateReviewSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  reply: z.string().max(5000).optional().nullable(),
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(200).optional().nullable(),
  body: z.string().min(1).max(5000).optional(),
});

export const replyReviewSchema = z.object({
  reply: z.string().min(1).max(5000),
});

// ==================== PUBLIC SUBMIT ====================

export const publicSubmitReviewSchema = z.object({
  tenantId: z.string().min(1),
  entityType: z.enum(["experience", "hotel", "spa", "restaurant"]),
  entityId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  authorName: z.string().min(1).max(200),
  authorEmail: z.string().email().optional().nullable(),
  title: z.string().max(200).optional().nullable(),
  body: z.string().min(1).max(5000),
  stayDate: z.coerce.date().optional().nullable(),
});
