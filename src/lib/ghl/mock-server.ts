import type {
  GHLContact,
  GHLConversation,
  GHLPipeline,
  GHLOpportunity,
  GHLMessage,
  GHLNote,
} from "./types";

export const MOCK_CONTACTS: GHLContact[] = [
  { id: "mock-contact-1", firstName: "María", lastName: "García", email: "maria.garcia@email.com", phone: "+34 612 345 678", tags: ["presupuesto", "baqueira"], source: "Formulario Web", dateAdded: "2026-03-01T10:30:00Z" },
  { id: "mock-contact-2", firstName: "Carlos", lastName: "Fernández", email: "carlos.f@email.com", phone: "+34 678 901 234", tags: ["presupuesto", "sierra-nevada"], source: "Instagram", dateAdded: "2026-03-02T14:00:00Z" },
  { id: "mock-contact-3", firstName: "Ana", lastName: "Martínez", email: "ana.martinez@email.com", phone: "+34 655 123 456", tags: ["cliente", "baqueira"], source: "WhatsApp", dateAdded: "2026-03-03T09:15:00Z" },
  { id: "mock-contact-4", firstName: "Pedro", lastName: "Sánchez", email: "pedro.sg@email.com", phone: "+34 699 876 543", tags: ["presupuesto", "formigal"], source: "Formulario Web", dateAdded: "2026-03-04T16:30:00Z" },
  { id: "mock-contact-5", firstName: "Laura", lastName: "Díaz", email: "laura.diaz@email.com", phone: "+34 633 456 789", tags: ["cliente", "alto-campoo"], source: "Facebook", dateAdded: "2026-03-05T11:00:00Z" },
  { id: "mock-contact-6", firstName: "Javier", lastName: "Romero", email: "javi.romero@email.com", phone: "+34 611 222 333", tags: ["presupuesto", "sierra-nevada"], source: "Instagram", dateAdded: "2026-03-06T08:45:00Z" },
  { id: "mock-contact-7", firstName: "Sofía", lastName: "López", email: "sofia.lopez@email.com", phone: "+34 644 555 666", tags: ["cliente", "baqueira"], source: "WhatsApp", dateAdded: "2026-03-07T13:20:00Z" },
  { id: "mock-contact-8", firstName: "Miguel", lastName: "Torres", email: "miguel.t@email.com", phone: "+34 677 888 999", tags: ["presupuesto", "grandvalira"], source: "Formulario Web", dateAdded: "2026-03-08T15:00:00Z" },
  { id: "mock-contact-9", firstName: "Elena", lastName: "Ruiz", email: "elena.ruiz@email.com", phone: "+34 622 111 444", tags: ["cliente-vip"], source: "Referido", dateAdded: "2026-03-09T10:30:00Z" },
  { id: "mock-contact-10", firstName: "Andrés", lastName: "Moreno", email: "andres.m@email.com", phone: "+34 655 777 000", tags: ["presupuesto", "baqueira"], source: "Google Ads", dateAdded: "2026-03-10T14:15:00Z" },
  { id: "mock-contact-11", firstName: "Carmen", lastName: "Jiménez", email: "carmen.j@email.com", phone: "+34 688 333 222", tags: ["cliente", "formigal"], source: "Facebook", dateAdded: "2026-03-10T09:00:00Z" },
  { id: "mock-contact-12", firstName: "Raúl", lastName: "Navarro", email: "raul.n@email.com", phone: "+34 611 444 555", tags: ["presupuesto", "sierra-nevada"], source: "Instagram", dateAdded: "2026-03-11T16:45:00Z" },
  { id: "mock-contact-13", firstName: "Isabel", lastName: "Herrero", email: "isabel.h@email.com", phone: "+34 633 666 888", tags: ["cliente", "baqueira"], source: "WhatsApp", dateAdded: "2026-03-11T11:30:00Z" },
  { id: "mock-contact-14", firstName: "Pablo", lastName: "Iglesias", email: "pablo.i@email.com", phone: "+34 699 222 111", tags: ["presupuesto", "grandvalira"], source: "Formulario Web", dateAdded: "2026-03-12T08:00:00Z" },
  { id: "mock-contact-15", firstName: "Marta", lastName: "Vega", email: "marta.v@email.com", phone: "+34 644 999 333", tags: ["cliente-vip", "baqueira"], source: "Referido", dateAdded: "2026-03-12T13:00:00Z" },
  { id: "mock-contact-16", firstName: "Diego", lastName: "Serrano", email: "diego.s@email.com", phone: "+34 677 111 888", tags: ["presupuesto"], source: "Google Ads", dateAdded: "2026-03-13T15:30:00Z" },
  { id: "mock-contact-17", firstName: "Lucía", lastName: "Molina", email: "lucia.m@email.com", phone: "+34 622 555 777", tags: ["presupuesto", "alto-campoo"], source: "Facebook", dateAdded: "2026-03-13T10:00:00Z" },
  { id: "mock-contact-18", firstName: "Fernando", lastName: "Gil", email: "fernando.g@email.com", phone: "+34 655 000 444", tags: ["cliente", "sierra-nevada"], source: "WhatsApp", dateAdded: "2026-03-14T14:30:00Z" },
  { id: "mock-contact-19", firstName: "Cristina", lastName: "Ramos", email: "cristina.r@email.com", phone: "+34 688 444 666", tags: ["presupuesto", "formigal"], source: "Instagram", dateAdded: "2026-03-14T09:45:00Z" },
  { id: "mock-contact-20", firstName: "Alberto", lastName: "Blanco", email: "alberto.b@email.com", phone: "+34 611 888 222", tags: ["presupuesto", "baqueira"], source: "Formulario Web", dateAdded: "2026-03-15T16:00:00Z" },
];

export const MOCK_CONVERSATIONS: GHLConversation[] = [
  { id: "mock-conv-1", contactId: "mock-contact-1", contactName: "María García", lastMessageBody: "Hola, quería información sobre paquetes de esquí en Baqueira para 4 personas", lastMessageDate: "2026-03-15T09:00:00Z", unreadCount: 2, assignedTo: null, type: "WhatsApp" },
  { id: "mock-conv-2", contactId: "mock-contact-2", contactName: "Carlos Fernández", lastMessageBody: "Genial, ¿me enviáis el presupuesto por email?", lastMessageDate: "2026-03-14T15:30:00Z", unreadCount: 0, assignedTo: "mock-user-1", type: "Instagram" },
  { id: "mock-conv-3", contactId: "mock-contact-3", contactName: "Ana Martínez", lastMessageBody: "¿Tenéis disponibilidad del 28 al 31 de marzo?", lastMessageDate: "2026-03-14T10:00:00Z", unreadCount: 1, assignedTo: null, type: "WhatsApp" },
  { id: "mock-conv-4", contactId: "mock-contact-5", contactName: "Laura Díaz", lastMessageBody: "Perfecto, ya he recibido el presupuesto. Lo reviso y os digo", lastMessageDate: "2026-03-13T14:20:00Z", unreadCount: 0, assignedTo: "mock-user-1", type: "Email" },
  { id: "mock-conv-5", contactId: "mock-contact-6", contactName: "Javier Romero", lastMessageBody: "Somos 6 adultos, queremos actividades de grupo en Sierra Nevada", lastMessageDate: "2026-03-13T11:00:00Z", unreadCount: 3, assignedTo: null, type: "SMS" },
  { id: "mock-conv-6", contactId: "mock-contact-7", contactName: "Sofía López", lastMessageBody: "¿El hotel Val de Neu tiene spa incluido?", lastMessageDate: "2026-03-12T16:45:00Z", unreadCount: 1, assignedTo: "mock-user-2", type: "WhatsApp" },
  { id: "mock-conv-7", contactId: "mock-contact-9", contactName: "Elena Ruiz", lastMessageBody: "¡Muchas gracias! El viaje fue increíble, repetiré seguro", lastMessageDate: "2026-03-12T09:30:00Z", unreadCount: 0, assignedTo: "mock-user-1", type: "WhatsApp" },
  { id: "mock-conv-8", contactId: "mock-contact-10", contactName: "Andrés Moreno", lastMessageBody: "Me interesa el pack familiar con clases para niños", lastMessageDate: "2026-03-11T13:15:00Z", unreadCount: 1, assignedTo: null, type: "Facebook" },
  { id: "mock-conv-9", contactId: "mock-contact-12", contactName: "Raúl Navarro", lastMessageBody: "¿Cuánto cuesta el forfait de Sierra Nevada para 3 días?", lastMessageDate: "2026-03-10T10:00:00Z", unreadCount: 0, assignedTo: "mock-user-2", type: "Instagram" },
  { id: "mock-conv-10", contactId: "mock-contact-14", contactName: "Pablo Iglesias", lastMessageBody: "Queremos ir a Grandvalira, ¿qué paquetes tenéis?", lastMessageDate: "2026-03-09T15:00:00Z", unreadCount: 2, assignedTo: null, type: "SMS" },
];

export const MOCK_MESSAGES: GHLMessage[] = [
  { id: "mock-msg-1", conversationId: "mock-conv-1", contactId: "mock-contact-1", body: "Hola, quería información sobre paquetes de esquí en Baqueira para 4 personas", direction: "inbound", status: "delivered", dateAdded: "2026-03-15T09:00:00Z", messageType: "WhatsApp" },
  { id: "mock-msg-2", conversationId: "mock-conv-1", contactId: "mock-contact-1", body: "¡Hola María! Encantados de atenderte. ¿Para qué fechas estáis pensando? ¿Sois adultos o hay niños también?", direction: "outbound", status: "delivered", dateAdded: "2026-03-15T09:05:00Z", messageType: "WhatsApp" },
  { id: "mock-msg-3", conversationId: "mock-conv-1", contactId: "mock-contact-1", body: "Del 20 al 25 de marzo. Somos 2 adultos y 2 niños. Queremos alojamiento, forfait y clases para los peques", direction: "inbound", status: "delivered", dateAdded: "2026-03-15T09:10:00Z", messageType: "WhatsApp" },
  { id: "mock-msg-4", conversationId: "mock-conv-1", contactId: "mock-contact-1", body: "¡Perfecto! Tenemos un pack familiar ideal para vosotros. Os preparo un presupuesto detallado y os lo envío por email. ¿Me confirmas tu correo?", direction: "outbound", status: "delivered", dateAdded: "2026-03-15T09:15:00Z", messageType: "WhatsApp" },
];

export const MOCK_PIPELINES: GHLPipeline[] = [
  {
    id: "mock-pipeline-1",
    name: "Presupuestos Ski",
    stages: [
      { id: "stage-1", name: "Solicitud Recibida", position: 0 },
      { id: "stage-2", name: "Presupuesto Enviado", position: 1 },
      { id: "stage-3", name: "En Negociación", position: 2 },
      { id: "stage-4", name: "Reserva Confirmada", position: 3 },
      { id: "stage-5", name: "Pagado", position: 4 },
      { id: "stage-6", name: "Completado", position: 5 },
    ],
  },
];

export const MOCK_OPPORTUNITIES: GHLOpportunity[] = [
  { id: "mock-opp-1", name: "María García — Baqueira Familia", pipelineId: "mock-pipeline-1", pipelineStageId: "stage-2", monetaryValue: 2850, contactId: "mock-contact-1", assignedTo: "mock-user-1", createdAt: "2026-03-01T08:00:00Z", status: "open" },
  { id: "mock-opp-2", name: "Carlos Fernández — Sierra Nevada Grupo", pipelineId: "mock-pipeline-1", pipelineStageId: "stage-1", monetaryValue: 1920, contactId: "mock-contact-2", assignedTo: null, createdAt: "2026-03-02T10:00:00Z", status: "open" },
  { id: "mock-opp-3", name: "Ana Martínez — Baqueira Pareja", pipelineId: "mock-pipeline-1", pipelineStageId: "stage-3", monetaryValue: 1450, contactId: "mock-contact-3", assignedTo: "mock-user-1", createdAt: "2026-03-03T14:00:00Z", status: "open" },
  { id: "mock-opp-4", name: "Pedro Sánchez — Formigal Familia", pipelineId: "mock-pipeline-1", pipelineStageId: "stage-4", monetaryValue: 3200, contactId: "mock-contact-4", assignedTo: "mock-user-2", createdAt: "2026-03-04T09:00:00Z", status: "open" },
  { id: "mock-opp-5", name: "Laura Díaz — Alto Campoo Weekend", pipelineId: "mock-pipeline-1", pipelineStageId: "stage-1", monetaryValue: 680, contactId: "mock-contact-5", assignedTo: null, createdAt: "2026-03-05T11:00:00Z", status: "open" },
  { id: "mock-opp-6", name: "Javier Romero — Sierra Nevada Empresa", pipelineId: "mock-pipeline-1", pipelineStageId: "stage-2", monetaryValue: 4500, contactId: "mock-contact-6", assignedTo: "mock-user-1", createdAt: "2026-03-06T15:00:00Z", status: "open" },
  { id: "mock-opp-7", name: "Sofía López — Baqueira Premium", pipelineId: "mock-pipeline-1", pipelineStageId: "stage-5", monetaryValue: 2100, contactId: "mock-contact-7", assignedTo: "mock-user-2", createdAt: "2026-03-07T08:00:00Z", status: "open" },
  { id: "mock-opp-8", name: "Miguel Torres — Grandvalira Amigos", pipelineId: "mock-pipeline-1", pipelineStageId: "stage-3", monetaryValue: 2400, contactId: "mock-contact-8", assignedTo: "mock-user-1", createdAt: "2026-03-08T13:00:00Z", status: "open" },
  { id: "mock-opp-9", name: "Andrés Moreno — Baqueira Familiar", pipelineId: "mock-pipeline-1", pipelineStageId: "stage-1", monetaryValue: 1800, contactId: "mock-contact-10", assignedTo: null, createdAt: "2026-03-10T10:00:00Z", status: "open" },
  { id: "mock-opp-10", name: "Pablo Iglesias — Grandvalira Grupo", pipelineId: "mock-pipeline-1", pipelineStageId: "stage-2", monetaryValue: 3600, contactId: "mock-contact-14", assignedTo: "mock-user-2", createdAt: "2026-03-12T16:00:00Z", status: "open" },
  { id: "mock-opp-11", name: "Cristina Ramos — Formigal Escapada", pipelineId: "mock-pipeline-1", pipelineStageId: "stage-1", monetaryValue: 950, contactId: "mock-contact-19", assignedTo: null, createdAt: "2026-03-14T09:00:00Z", status: "open" },
  { id: "mock-opp-12", name: "Elena Ruiz — Baqueira VIP", pipelineId: "mock-pipeline-1", pipelineStageId: "stage-6", monetaryValue: 5200, contactId: "mock-contact-9", assignedTo: "mock-user-1", createdAt: "2026-02-15T08:00:00Z", status: "won" },
  { id: "mock-opp-13", name: "Fernando Gil — Sierra Nevada", pipelineId: "mock-pipeline-1", pipelineStageId: "stage-6", monetaryValue: 1850, contactId: "mock-contact-18", assignedTo: "mock-user-2", createdAt: "2026-02-20T12:00:00Z", status: "won" },
  { id: "mock-opp-14", name: "Carmen Jiménez — Formigal", pipelineId: "mock-pipeline-1", pipelineStageId: "stage-6", monetaryValue: 2300, contactId: "mock-contact-11", assignedTo: "mock-user-1", createdAt: "2026-02-25T14:00:00Z", status: "won" },
  { id: "mock-opp-15", name: "Alberto Blanco — Baqueira Nuevo", pipelineId: "mock-pipeline-1", pipelineStageId: "stage-1", monetaryValue: 1650, contactId: "mock-contact-20", assignedTo: null, createdAt: "2026-03-15T10:00:00Z", status: "open" },
];

export const MOCK_NOTES: GHLNote[] = [
  { id: "mock-note-1", contactId: "mock-contact-1", body: "Primera vez esquiando en familia. Quieren algo cómodo con clases para los niños.", userId: "mock-user-1", dateAdded: "2026-03-10T14:00:00Z" },
  { id: "mock-note-2", contactId: "mock-contact-1", body: "Presupuesto enviado: Apt. Maladeta 4pax + forfaits + cursillo infantil. Total 2.850€", userId: "mock-user-1", dateAdded: "2026-03-11T09:30:00Z" },
  { id: "mock-note-3", contactId: "mock-contact-4", body: "Familia con presupuesto ajustado. Ofrecer Formigal en vez de Baqueira.", userId: "mock-user-2", dateAdded: "2026-03-09T16:00:00Z" },
];

// GHL raw response — mock client that returns mock data
export interface MockGHLClient {
  get: (url: string, config?: { params?: Record<string, string> }) => Promise<{ data: unknown }>;
  post: (url: string, body?: unknown) => Promise<{ data: unknown }>;
  put: (url: string, body?: unknown) => Promise<{ data: unknown }>;
  delete: (url: string) => Promise<{ data: unknown }>;
}

export function createMockGHLClient(): MockGHLClient {
  return {
    get: async (url: string) => {
      if (url.includes("/contacts/") && !url.includes("/notes")) {
        const id = url.split("/contacts/")[1].split("/")[0];
        const contact = MOCK_CONTACTS.find((c) => c.id === id);
        return { data: { contact: contact ?? MOCK_CONTACTS[0] } };
      }
      if (url.includes("/contacts") && url.includes("/notes")) {
        const contactId = url.split("/contacts/")[1].split("/")[0];
        return {
          data: { notes: MOCK_NOTES.filter((n) => n.contactId === contactId) },
        };
      }
      if (url.includes("/contacts")) {
        return {
          data: {
            contacts: MOCK_CONTACTS,
            meta: { total: MOCK_CONTACTS.length, currentPage: 1, nextPage: null },
          },
        };
      }
      if (url.includes("/conversations/") && url.includes("/messages")) {
        return { data: { messages: MOCK_MESSAGES, nextPage: null } };
      }
      if (url.includes("/conversations/search") || url.includes("/conversations")) {
        return {
          data: { conversations: MOCK_CONVERSATIONS, total: MOCK_CONVERSATIONS.length },
        };
      }
      if (url.includes("/opportunities/pipelines")) {
        return { data: { pipelines: MOCK_PIPELINES } };
      }
      if (url.includes("/opportunities/search") || url.includes("/opportunities")) {
        return {
          data: {
            opportunities: MOCK_OPPORTUNITIES,
            meta: { total: MOCK_OPPORTUNITIES.length, currentPage: 1, nextPage: null },
          },
        };
      }
      if (url.includes("/locations/")) {
        return {
          data: {
            location: {
              id: "mock-location-1",
              name: "Skicenter Spain",
              address: "Calle Gran Vía 42",
              city: "Madrid",
              state: "Madrid",
              country: "ES",
              phone: "+34 900 123 456",
              website: "https://skicenter.es",
            },
          },
        };
      }
      return { data: {} };
    },
    post: async (_url: string, body?: unknown) => {
      const payload = body as Record<string, unknown> | undefined;
      return { data: { ...payload, id: `mock-${Date.now()}` } };
    },
    put: async (_url: string, body?: unknown) => {
      const payload = body as Record<string, unknown> | undefined;
      return { data: { ...payload, updatedAt: new Date().toISOString() } };
    },
    delete: async () => {
      return { data: { succeeded: true } };
    },
  };
}
