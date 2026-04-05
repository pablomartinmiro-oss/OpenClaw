export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { apiError } from "@/lib/api-response";

const TEMPLATES = [
  { id: "hotel_confirmation", name: "Confirmacion hotel", category: "Reservas", active: true },
  { id: "spa_confirmation", name: "Confirmacion spa", category: "Reservas", active: true },
  { id: "restaurant_confirmation", name: "Confirmacion restaurante", category: "Reservas", active: true },
  { id: "invoice_email", name: "Envio factura", category: "Finanzas", active: true },
  { id: "settlement_notification", name: "Notificacion liquidacion", category: "Proveedores", active: true },
  { id: "order_confirmation", name: "Confirmacion pedido", category: "Tienda", active: true },
  { id: "quote_reminder_1", name: "Recordatorio 24h", category: "Presupuestos", active: true },
  { id: "quote_reminder_2", name: "Recordatorio 48h", category: "Presupuestos", active: true },
  { id: "quote_discount", name: "Oferta descuento", category: "Presupuestos", active: true },
  { id: "cancellation_client", name: "Cancelacion cliente", category: "Cancelaciones", active: true },
  { id: "cancellation_admin", name: "Cancelacion admin", category: "Cancelaciones", active: true },
  { id: "voucher_issued", name: "Bono emitido", category: "Bonos", active: true },
];

export async function GET() {
  try {
    const [session, authError] = await requireTenant();
    if (authError) return authError;

    // For now, return static templates. In the future, these can be
    // persisted per-tenant with custom subject/body overrides.
    return NextResponse.json({ templates: TEMPLATES });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al cargar plantillas de email",
      code: "EMAIL_TEMPLATES_ERROR",
    });
  }
}
