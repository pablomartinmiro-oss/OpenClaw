import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

const log = logger.child({ module: 'tasks' })

interface QuoteItemForTask {
  id: string
  category: string | null
  name: string
  startDate: Date | null
  seguroIncluido: boolean | null
}

interface QuoteForTask {
  id: string
  tenantId: string
  items: QuoteItemForTask[]
}

/**
 * Generate automatic tasks when a quote moves to PAID status.
 * Each product type triggers specific follow-up tasks.
 */
export async function generateTasksForPaidQuote(quote: QuoteForTask): Promise<number> {
  const tasks: Array<{
    tenantId: string
    quoteId: string
    quoteItemId: string | null
    type: string
    title: string
    description: string | null
    dueDate: Date | null
  }> = []

  for (const item of quote.items) {
    const cat = item.category?.toLowerCase() ?? inferCategory(item.name)
    if (!cat) continue

    const startDate = item.startDate

    if (cat === 'alojamiento') {
      tasks.push({
        tenantId: quote.tenantId,
        quoteId: quote.id,
        quoteItemId: item.id,
        type: 'request_dni',
        title: `Solicitar DNIs — ${item.name}`,
        description: 'Solicitar DNI de todos los huéspedes para el registro del alojamiento.',
        dueDate: null, // immediate
      })
      if (startDate) {
        const checkDniDate = new Date(startDate)
        checkDniDate.setDate(checkDniDate.getDate() - 10)
        tasks.push({
          tenantId: quote.tenantId,
          quoteId: quote.id,
          quoteItemId: item.id,
          type: 'check_dni',
          title: `Comprobar DNIs — ${item.name}`,
          description: 'Verificar que todos los DNIs han sido recibidos antes del check-in.',
          dueDate: checkDniDate,
        })
      }
    }

    if (cat === 'forfait') {
      if (!item.seguroIncluido) {
        tasks.push({
          tenantId: quote.tenantId,
          quoteId: quote.id,
          quoteItemId: item.id,
          type: 'offer_insurance',
          title: `Ofrecer seguro de forfait — ${item.name}`,
          description: 'El cliente no ha contratado seguro. Enviar oferta de seguro por WhatsApp/email.',
          dueDate: null,
        })
      }
    }

    if (cat === 'alquiler') {
      tasks.push({
        tenantId: quote.tenantId,
        quoteId: quote.id,
        quoteItemId: item.id,
        type: 'request_sizes',
        title: `Solicitar tallas y datos — ${item.name}`,
        description: 'Solicitar talla de botas, altura/peso y DNI del cliente.',
        dueDate: null,
      })
      if (startDate) {
        const prepDate = new Date(startDate)
        prepDate.setDate(prepDate.getDate() - 2)
        tasks.push({
          tenantId: quote.tenantId,
          quoteId: quote.id,
          quoteItemId: item.id,
          type: 'prepare_material',
          title: `Preparar material — ${item.name}`,
          description: 'Preparar el material reservado antes de la fecha de inicio.',
          dueDate: prepDate,
        })
      }
    }

    if (cat === 'clase_particular' || cat === 'escuela') {
      tasks.push({
        tenantId: quote.tenantId,
        quoteId: quote.id,
        quoteItemId: item.id,
        type: 'validate_level',
        title: `Validar nivel del cliente — ${item.name}`,
        description: 'Enviar explicación de niveles con vídeo y confirmar nivel del cliente.',
        dueDate: null,
      })
    }

    if (cat === 'apreski' || cat === 'snowcamp' || cat === 'taxi') {
      tasks.push({
        tenantId: quote.tenantId,
        quoteId: quote.id,
        quoteItemId: item.id,
        type: 'send_location',
        title: `Enviar ubicación y requisitos — ${item.name}`,
        description: 'Enviar punto de encuentro, hora y requisitos de la actividad.',
        dueDate: null,
      })
    }

    // Pack = composite — generates tasks for each component type
    if (cat === 'pack') {
      tasks.push({
        tenantId: quote.tenantId,
        quoteId: quote.id,
        quoteItemId: item.id,
        type: 'request_sizes',
        title: `Solicitar tallas y datos (pack) — ${item.name}`,
        description: 'Pack incluye material: solicitar talla de botas, altura/peso y DNI.',
        dueDate: null,
      })
      tasks.push({
        tenantId: quote.tenantId,
        quoteId: quote.id,
        quoteItemId: item.id,
        type: 'validate_level',
        title: `Validar nivel (pack) — ${item.name}`,
        description: 'Pack incluye clases: confirmar nivel del cliente.',
        dueDate: null,
      })
    }
  }

  if (tasks.length === 0) {
    log.info({ quoteId: quote.id }, 'No tasks generated for paid quote')
    return 0
  }

  const result = await prisma.task.createMany({ data: tasks })
  log.info({ quoteId: quote.id, count: result.count }, 'Auto-tasks generated')
  return result.count
}

/** Infer category from product name when category field is null */
function inferCategory(name: string): string | null {
  const lower = name.toLowerCase()
  if (lower.includes('forfait')) return 'forfait'
  if (lower.includes('alquiler') || lower.includes('material') || lower.includes('equipo')) return 'alquiler'
  if (lower.includes('clase particular') || lower.includes('privada')) return 'clase_particular'
  if (lower.includes('cursillo') || lower.includes('colectiv') || lower.includes('escuelita')) return 'escuela'
  if (lower.includes('alojamiento') || lower.includes('hotel') || lower.includes('apartamento')) return 'alojamiento'
  if (lower.includes('après') || lower.includes('apreski') || lower.includes('apres')) return 'apreski'
  if (lower.includes('snowcamp')) return 'snowcamp'
  if (lower.includes('taxi') || lower.includes('transfer')) return 'taxi'
  if (lower.includes('pack') || lower.includes('all in')) return 'pack'
  return null
}
