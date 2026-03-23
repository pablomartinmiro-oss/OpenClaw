// Company-specific knowledge for the AI assistant
export const COMPANY_KNOWLEDGE = {
  // Ski stations we work with
  stations: [
    { name: "Baqueira Beret", location: "Valle de Arán, Lleida", maxCapacity: 60 },
    { name: "Sierra Nevada", location: "Granada", maxCapacity: 40 },
    { name: "Formigal", location: "Huesca", maxCapacity: 40 },
    { name: "La Pinilla", location: "Segovia", maxCapacity: 25 },
    { name: "Grandvalira", location: "Andorra", maxCapacity: 40 },
  ],

  // Product categories
  categories: [
    "Alquiler Material",
    "Lockers / Guardaropa",
    "Escuela (cursos grupales)",
    "Clases Particulares",
    "Forfaits",
    "Après-ski",
    "Menú",
    "SnowCamp",
    "Taxi",
    "Packs"
  ],

  // Season periods
  seasonPeriods: [
    { name: "Media", period: "Nov-Dic, Ene-Feb, Abr" },
    { name: "Alta", period: "Navidades, Carnaval, Semana Santa" }
  ],

  // Business rules
  rules: {
    quoteExpiryDays: 14,
    followUpSequence: [3, 7, 14],
    maxGroupSize: 20,
    minAdvanceBooking: 1, // day
    paymentMethods: ["Groupon", "Efectivo", "Tarjeta", "Transferencia"]
  },

  // Common tasks
  commonTasks: [
    "Crear presupuesto",
    "Enviar recordatorio de presupuesto",
    "Verificar disponibilidad",
    "Confirmar reserva",
    "Asignar conversación",
    "Revisar pipeline",
    "Generar informe de ingresos"
  ],

  // Key metrics to track
  keyMetrics: [
    "Reservas del día",
    "Presupuestos pendientes",
    "Valor del pipeline",
    "Tasa de conversión",
    "Ingresos por estación",
    "Ocupación de cursillos"
  ]
};

// Helper to format company info for prompts
export function getCompanyContext(): string {
  return `ESTACIONES: ${COMPANY_KNOWLEDGE.stations.map(s => s.name).join(", ")}
CATEGORÍAS: ${COMPANY_KNOWLEDGE.categories.join(", ")}
PERÍODOS: ${COMPANY_KNOWLEDGE.seasonPeriods.map(p => `${p.name} (${p.period})`).join("; ")}
REGLAS: Presupuestos expiran en ${COMPANY_KNOWLEDGE.rules.quoteExpiryDays} días. Seguimiento automático a los ${COMPANY_KNOWLEDGE.rules.followUpSequence.join(", ")} días.`;
}
