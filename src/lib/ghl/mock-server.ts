import type {
  GHLContact,
  GHLConversation,
  GHLPipeline,
  GHLOpportunity,
  GHLMessage,
  GHLNote,
} from "./types";

export const MOCK_CONTACTS: GHLContact[] = [
  { id: "mock-contact-1", firstName: "Sarah", lastName: "Johnson", email: "sarah@example.com", phone: "+16155551234", tags: ["hot-lead", "facebook-ad"], source: "Facebook Ads", dateAdded: "2025-12-15T10:30:00Z" },
  { id: "mock-contact-2", firstName: "Mike", lastName: "Chen", email: "mike@example.com", phone: "+16155555678", tags: ["cold", "referral"], source: "Referral", dateAdded: "2025-12-20T14:00:00Z" },
  { id: "mock-contact-3", firstName: "Lisa", lastName: "Park", email: "lisa@example.com", phone: "+16155559012", tags: ["warm", "google-ad"], source: "Google Ads", dateAdded: "2026-01-02T09:15:00Z" },
  { id: "mock-contact-4", firstName: "James", lastName: "Wilson", email: "james@example.com", phone: "+16155553456", tags: ["hot-lead"], source: "Website", dateAdded: "2026-01-05T16:30:00Z" },
  { id: "mock-contact-5", firstName: "Emma", lastName: "Davis", email: "emma@example.com", phone: "+16155557890", tags: ["referral"], source: "Referral", dateAdded: "2026-01-10T11:00:00Z" },
  { id: "mock-contact-6", firstName: "Carlos", lastName: "Rodriguez", email: "carlos@example.com", phone: "+16155551122", tags: ["facebook-ad", "warm"], source: "Facebook Ads", dateAdded: "2026-01-12T08:45:00Z" },
  { id: "mock-contact-7", firstName: "Anna", lastName: "Kim", email: "anna@example.com", phone: "+16155553344", tags: ["google-ad"], source: "Google Ads", dateAdded: "2026-01-15T13:20:00Z" },
  { id: "mock-contact-8", firstName: "David", lastName: "Brown", email: "david@example.com", phone: "+16155555566", tags: ["hot-lead", "website"], source: "Website", dateAdded: "2026-01-18T15:00:00Z" },
  { id: "mock-contact-9", firstName: "Rachel", lastName: "Taylor", email: "rachel@example.com", phone: "+16155557788", tags: ["cold"], source: "Cold Call", dateAdded: "2026-01-20T10:30:00Z" },
  { id: "mock-contact-10", firstName: "Tom", lastName: "Martinez", email: "tom@example.com", phone: "+16155559900", tags: ["warm", "referral"], source: "Referral", dateAdded: "2026-01-22T14:15:00Z" },
  { id: "mock-contact-11", firstName: "Sophie", lastName: "Lee", email: "sophie@example.com", phone: "+16155551133", tags: ["facebook-ad"], source: "Facebook Ads", dateAdded: "2026-01-25T09:00:00Z" },
  { id: "mock-contact-12", firstName: "Ryan", lastName: "White", email: "ryan@example.com", phone: "+16155553355", tags: ["google-ad", "hot-lead"], source: "Google Ads", dateAdded: "2026-01-28T16:45:00Z" },
  { id: "mock-contact-13", firstName: "Megan", lastName: "Harris", email: "megan@example.com", phone: "+16155555577", tags: ["warm"], source: "Website", dateAdded: "2026-02-01T11:30:00Z" },
  { id: "mock-contact-14", firstName: "Kevin", lastName: "Clark", email: "kevin@example.com", phone: "+16155557799", tags: ["referral", "hot-lead"], source: "Referral", dateAdded: "2026-02-05T08:00:00Z" },
  { id: "mock-contact-15", firstName: "Amy", lastName: "Lewis", email: "amy@example.com", phone: "+16155559911", tags: ["cold", "google-ad"], source: "Google Ads", dateAdded: "2026-02-08T13:00:00Z" },
  { id: "mock-contact-16", firstName: "Brian", lastName: "Walker", email: "brian@example.com", phone: "+16155552244", tags: ["website"], source: "Website", dateAdded: "2026-02-10T15:30:00Z" },
  { id: "mock-contact-17", firstName: "Jenny", lastName: "Hall", email: "jenny@example.com", phone: "+16155554466", tags: ["facebook-ad", "hot-lead"], source: "Facebook Ads", dateAdded: "2026-02-12T10:00:00Z" },
  { id: "mock-contact-18", firstName: "Marcus", lastName: "Allen", email: "marcus@example.com", phone: "+16155556688", tags: ["warm", "referral"], source: "Referral", dateAdded: "2026-02-15T14:30:00Z" },
  { id: "mock-contact-19", firstName: "Laura", lastName: "Young", email: "laura@example.com", phone: "+16155558800", tags: ["google-ad"], source: "Google Ads", dateAdded: "2026-02-18T09:45:00Z" },
  { id: "mock-contact-20", firstName: "Steve", lastName: "King", email: "steve@example.com", phone: "+16155550022", tags: ["cold", "website"], source: "Website", dateAdded: "2026-02-20T16:00:00Z" },
];

export const MOCK_CONVERSATIONS: GHLConversation[] = [
  { id: "mock-conv-1", contactId: "mock-contact-1", contactName: "Sarah Johnson", lastMessageBody: "Hey, I saw your ad about selling my house. Can you help?", lastMessageDate: "2026-03-12T09:00:00Z", unreadCount: 2, assignedTo: null, type: "SMS" },
  { id: "mock-conv-2", contactId: "mock-contact-2", contactName: "Mike Chen", lastMessageBody: "Thanks for the info! When can we schedule a call?", lastMessageDate: "2026-03-11T15:30:00Z", unreadCount: 0, assignedTo: "mock-user-1", type: "SMS" },
  { id: "mock-conv-3", contactId: "mock-contact-3", contactName: "Lisa Park", lastMessageBody: "I'd like to know more about your services", lastMessageDate: "2026-03-11T10:00:00Z", unreadCount: 1, assignedTo: null, type: "SMS" },
  { id: "mock-conv-4", contactId: "mock-contact-4", contactName: "James Wilson", lastMessageBody: "Yes, that time works for me!", lastMessageDate: "2026-03-10T14:20:00Z", unreadCount: 0, assignedTo: "mock-user-1", type: "SMS" },
  { id: "mock-conv-5", contactId: "mock-contact-5", contactName: "Emma Davis", lastMessageBody: "Can you send me the contract?", lastMessageDate: "2026-03-10T11:00:00Z", unreadCount: 3, assignedTo: null, type: "SMS" },
  { id: "mock-conv-6", contactId: "mock-contact-8", contactName: "David Brown", lastMessageBody: "I have a few questions about the pricing", lastMessageDate: "2026-03-09T16:45:00Z", unreadCount: 1, assignedTo: "mock-user-2", type: "SMS" },
  { id: "mock-conv-7", contactId: "mock-contact-10", contactName: "Tom Martinez", lastMessageBody: "Sounds great, let's move forward!", lastMessageDate: "2026-03-09T09:30:00Z", unreadCount: 0, assignedTo: "mock-user-1", type: "SMS" },
  { id: "mock-conv-8", contactId: "mock-contact-12", contactName: "Ryan White", lastMessageBody: "Is this still available?", lastMessageDate: "2026-03-08T13:15:00Z", unreadCount: 1, assignedTo: null, type: "SMS" },
  { id: "mock-conv-9", contactId: "mock-contact-14", contactName: "Kevin Clark", lastMessageBody: "I was referred by a friend. Interested!", lastMessageDate: "2026-03-07T10:00:00Z", unreadCount: 0, assignedTo: "mock-user-2", type: "SMS" },
  { id: "mock-conv-10", contactId: "mock-contact-17", contactName: "Jenny Hall", lastMessageBody: "What are the next steps?", lastMessageDate: "2026-03-06T15:00:00Z", unreadCount: 2, assignedTo: null, type: "SMS" },
];

export const MOCK_MESSAGES: GHLMessage[] = [
  { id: "mock-msg-1", conversationId: "mock-conv-1", contactId: "mock-contact-1", body: "Hey, I saw your ad about selling my house. Can you help?", direction: "inbound", status: "delivered", dateAdded: "2026-03-12T09:00:00Z", messageType: "SMS" },
  { id: "mock-msg-2", conversationId: "mock-conv-1", contactId: "mock-contact-1", body: "Hi Sarah! Absolutely, we'd love to help. What area is your property in?", direction: "outbound", status: "delivered", dateAdded: "2026-03-12T09:05:00Z", messageType: "SMS" },
  { id: "mock-msg-3", conversationId: "mock-conv-1", contactId: "mock-contact-1", body: "It's in the downtown area, 3 bed 2 bath", direction: "inbound", status: "delivered", dateAdded: "2026-03-12T09:10:00Z", messageType: "SMS" },
  { id: "mock-msg-4", conversationId: "mock-conv-1", contactId: "mock-contact-1", body: "That sounds like a great property! Can I schedule a time to come by and take a look?", direction: "outbound", status: "delivered", dateAdded: "2026-03-12T09:15:00Z", messageType: "SMS" },
];

export const MOCK_PIPELINES: GHLPipeline[] = [
  {
    id: "mock-pipeline-1",
    name: "Sales Pipeline",
    stages: [
      { id: "stage-1", name: "New Lead", position: 0 },
      { id: "stage-2", name: "Contacted", position: 1 },
      { id: "stage-3", name: "Appointment Set", position: 2 },
      { id: "stage-4", name: "Offer Made", position: 3 },
      { id: "stage-5", name: "Under Contract", position: 4 },
      { id: "stage-6", name: "Closed Won", position: 5 },
    ],
  },
];

export const MOCK_OPPORTUNITIES: GHLOpportunity[] = [
  { id: "mock-opp-1", name: "Sarah Johnson - 123 Main St", pipelineId: "mock-pipeline-1", pipelineStageId: "stage-2", monetaryValue: 15000, contactId: "mock-contact-1", assignedTo: "mock-user-1", createdAt: "2026-01-10T08:00:00Z", status: "open" },
  { id: "mock-opp-2", name: "Mike Chen - 456 Oak Ave", pipelineId: "mock-pipeline-1", pipelineStageId: "stage-1", monetaryValue: 8500, contactId: "mock-contact-2", assignedTo: null, createdAt: "2026-01-15T10:00:00Z", status: "open" },
  { id: "mock-opp-3", name: "Lisa Park - 789 Pine Rd", pipelineId: "mock-pipeline-1", pipelineStageId: "stage-3", monetaryValue: 22000, contactId: "mock-contact-3", assignedTo: "mock-user-1", createdAt: "2026-01-20T14:00:00Z", status: "open" },
  { id: "mock-opp-4", name: "James Wilson - 321 Elm St", pipelineId: "mock-pipeline-1", pipelineStageId: "stage-4", monetaryValue: 35000, contactId: "mock-contact-4", assignedTo: "mock-user-2", createdAt: "2026-01-25T09:00:00Z", status: "open" },
  { id: "mock-opp-5", name: "Emma Davis - 654 Maple Dr", pipelineId: "mock-pipeline-1", pipelineStageId: "stage-1", monetaryValue: 12000, contactId: "mock-contact-5", assignedTo: null, createdAt: "2026-02-01T11:00:00Z", status: "open" },
  { id: "mock-opp-6", name: "Carlos Rodriguez - 987 Cedar Ln", pipelineId: "mock-pipeline-1", pipelineStageId: "stage-2", monetaryValue: 18500, contactId: "mock-contact-6", assignedTo: "mock-user-1", createdAt: "2026-02-05T15:00:00Z", status: "open" },
  { id: "mock-opp-7", name: "David Brown - 147 Birch Way", pipelineId: "mock-pipeline-1", pipelineStageId: "stage-5", monetaryValue: 42000, contactId: "mock-contact-8", assignedTo: "mock-user-2", createdAt: "2026-02-10T08:00:00Z", status: "open" },
  { id: "mock-opp-8", name: "Tom Martinez - 258 Walnut Ct", pipelineId: "mock-pipeline-1", pipelineStageId: "stage-3", monetaryValue: 16000, contactId: "mock-contact-10", assignedTo: "mock-user-1", createdAt: "2026-02-15T13:00:00Z", status: "open" },
  { id: "mock-opp-9", name: "Ryan White - 369 Spruce Pl", pipelineId: "mock-pipeline-1", pipelineStageId: "stage-1", monetaryValue: 9500, contactId: "mock-contact-12", assignedTo: null, createdAt: "2026-02-20T10:00:00Z", status: "open" },
  { id: "mock-opp-10", name: "Kevin Clark - 741 Aspen Blvd", pipelineId: "mock-pipeline-1", pipelineStageId: "stage-4", monetaryValue: 28000, contactId: "mock-contact-14", assignedTo: "mock-user-2", createdAt: "2026-02-25T16:00:00Z", status: "open" },
  { id: "mock-opp-11", name: "Jenny Hall - 852 Willow St", pipelineId: "mock-pipeline-1", pipelineStageId: "stage-2", monetaryValue: 20000, contactId: "mock-contact-17", assignedTo: null, createdAt: "2026-03-01T09:00:00Z", status: "open" },
  { id: "mock-opp-12", name: "Anna Kim - 963 Cherry Ave", pipelineId: "mock-pipeline-1", pipelineStageId: "stage-6", monetaryValue: 55000, contactId: "mock-contact-7", assignedTo: "mock-user-1", createdAt: "2026-01-05T08:00:00Z", status: "won" },
  { id: "mock-opp-13", name: "Sophie Lee - 159 Hickory Dr", pipelineId: "mock-pipeline-1", pipelineStageId: "stage-6", monetaryValue: 31000, contactId: "mock-contact-11", assignedTo: "mock-user-2", createdAt: "2026-01-18T12:00:00Z", status: "won" },
  { id: "mock-opp-14", name: "Marcus Allen - 357 Poplar Rd", pipelineId: "mock-pipeline-1", pipelineStageId: "stage-3", monetaryValue: 14500, contactId: "mock-contact-18", assignedTo: "mock-user-1", createdAt: "2026-03-05T14:00:00Z", status: "open" },
  { id: "mock-opp-15", name: "Laura Young - 468 Sycamore Ct", pipelineId: "mock-pipeline-1", pipelineStageId: "stage-1", monetaryValue: 11000, contactId: "mock-contact-19", assignedTo: null, createdAt: "2026-03-08T10:00:00Z", status: "open" },
];

export const MOCK_NOTES: GHLNote[] = [
  { id: "mock-note-1", contactId: "mock-contact-1", body: "Spoke with Sarah about her property. She's motivated to sell within 60 days.", userId: "mock-user-1", dateAdded: "2026-03-10T14:00:00Z" },
  { id: "mock-note-2", contactId: "mock-contact-1", body: "Property is a 3bed/2bath in downtown. Estimated value $320k.", userId: "mock-user-1", dateAdded: "2026-03-11T09:30:00Z" },
  { id: "mock-note-3", contactId: "mock-contact-4", body: "James confirmed appointment for Thursday at 2pm.", userId: "mock-user-2", dateAdded: "2026-03-09T16:00:00Z" },
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
              name: "Demo Company HQ",
              address: "123 Business Ave",
              city: "Nashville",
              state: "TN",
              country: "US",
              phone: "+16155550000",
              website: "https://demo-company.com",
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
