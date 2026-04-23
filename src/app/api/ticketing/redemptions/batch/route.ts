export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, batchCouponSubmissionSchema } from "@/lib/validation";
import { extractCouponData } from "@/lib/ticketing/ocr";
import { checkDuplicates } from "@/lib/ticketing/duplicate-check";
import type { Prisma } from "@/generated/prisma/client";

interface BatchResult {
  index: number;
  code: string;
  status: "created" | "duplicate" | "error";
  redemptionId?: string;
  ocrConfidence?: string;
  hardDuplicate?: boolean;
  softDuplicate?: boolean;
  error?: string;
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modError = await requireModule(tenantId, "ticketing");
  if (modError) return modError;

  const log = logger.child({ tenantId, path: "/api/ticketing/redemptions/batch" });

  try {
    const body = await request.json();
    const validated = validateBody(body, batchCouponSubmissionSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const { coupons } = validated.data;
    const results: BatchResult[] = [];

    for (let i = 0; i < coupons.length; i++) {
      const coupon = coupons[i];
      let ocrData = null;

      try {
        // 1. Run OCR if image provided
        if (coupon.imageBase64) {
          ocrData = await extractCouponData(coupon.imageBase64);
          // Use OCR code if no code was provided
          if (!coupon.code && ocrData.code) {
            coupon.code = ocrData.code;
          }
        }

        // 2. Check duplicates
        const dupCheck = await checkDuplicates(
          tenantId,
          coupon.code,
          coupon.email,
          coupon.phone
        );

        if (dupCheck.hardDuplicate) {
          results.push({
            index: i,
            code: coupon.code,
            status: "duplicate",
            hardDuplicate: true,
            softDuplicate: false,
            ocrConfidence: ocrData?.confidence,
          });
          continue;
        }

        // 3. Create redemption
        const ocrJson = ocrData
          ? (JSON.parse(JSON.stringify(ocrData)) as Prisma.InputJsonValue)
          : undefined;

        const redemption = await prisma.couponRedemption.create({
          data: {
            tenantId,
            code: coupon.code,
            email: coupon.email ?? null,
            phone: coupon.phone ?? null,
            status: "received",
            financialStatus: "pending",
            ocrExtraction: ocrJson,
          },
        });

        results.push({
          index: i,
          code: coupon.code,
          status: "created",
          redemptionId: redemption.id,
          ocrConfidence: ocrData?.confidence,
          softDuplicate: dupCheck.softDuplicate,
        });
      } catch (error) {
        log.error({ index: i, code: coupon.code, err: error }, "Batch item failed");
        results.push({
          index: i,
          code: coupon.code,
          status: "error",
          error: "Error al procesar cupón",
        });
      }
    }

    const created = results.filter((r) => r.status === "created").length;
    const duplicates = results.filter((r) => r.status === "duplicate").length;
    log.info({ total: coupons.length, created, duplicates }, "Batch submission complete");

    return NextResponse.json({ results, summary: { total: coupons.length, created, duplicates } });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al procesar lote de cupones",
      code: "TICKETING_BATCH_ERROR",
      logContext: { tenantId },
    });
  }
}
