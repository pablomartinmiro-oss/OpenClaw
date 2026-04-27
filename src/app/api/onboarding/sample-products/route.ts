export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody } from "@/lib/validation";

const sampleProductSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.string().min(1).max(50),
  price: z.coerce.number().min(0).max(100000),
});

const bulkSchema = z.object({
  products: z.array(sampleProductSchema).min(1).max(10),
});

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const log = logger.child({ tenantId, path: "/api/onboarding/sample-products" });

  try {
    const body = await request.json();
    const validated = validateBody(body, bulkSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const created = await prisma.$transaction(
      validated.data.products.map((p, i) =>
        prisma.product.create({
          data: {
            tenantId,
            name: p.name,
            category: p.category,
            station: "all",
            price: p.price,
            priceType: "fixed",
            sortOrder: i,
            isActive: true,
            isPublished: true,
          },
        })
      )
    );

    log.info({ count: created.length }, "Sample products created");
    return NextResponse.json({ ok: true, count: created.length });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al crear productos de ejemplo",
      code: "ONBOARDING_PRODUCTS_ERROR",
      logContext: { tenantId },
    });
  }
}
