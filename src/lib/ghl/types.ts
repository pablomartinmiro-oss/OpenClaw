// GHL API response types

// ==================== CONTACTS ====================
export interface GHLContact {
  id: string;
  firstName: string;
  lastName: string;
  name?: string;
  email: string | null;
  phone: string | null;
  tags: string[];
  source: string | null;
  dateAdded: string;
  lastActivity?: string;
  dnd?: boolean;
  customFields?: Record<string, string>;
  address1?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  companyName?: string;
  website?: string;
}

export interface GHLContactsResponse {
  contacts: GHLContact[];
  meta: { total: number; currentPage: number; nextPage: number | null; startAfterId?: string; startAfter?: number };
}

export interface CreateContactData {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  source?: string;
  customField?: Record<string, string>;
  address1?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  companyName?: string;
  website?: string;
}

export type UpdateContactData = Partial<CreateContactData>;

// ==================== CONVERSATIONS ====================
export interface GHLConversation {
  id: string;
  contactId: string;
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
  lastMessageBody: string;
  lastMessageDate: string;
  lastMessageType?: string;
  unreadCount: number;
  assignedTo: string | null;
  type: string;
}

export interface GHLConversationsResponse {
  conversations: GHLConversation[];
  total: number;
}

// ==================== MESSAGES ====================
export interface GHLMessage {
  id: string;
  conversationId: string;
  contactId: string;
  body: string;
  direction: "inbound" | "outbound";
  status: string;
  dateAdded: string;
  messageType: string;
  attachments?: string[];
}

export interface GHLMessagesResponse {
  messages: GHLMessage[];
  nextPage: string | null;
}

export interface SendMessageData {
  conversationId: string;
  type: "SMS" | "Email" | "WhatsApp" | "Live_Chat";
  body: string;
  html?: string;
  subject?: string;
}

// ==================== PIPELINES & OPPORTUNITIES ====================
export interface GHLPipelineStage {
  id: string;
  name: string;
  position: number;
}

export interface GHLPipeline {
  id: string;
  name: string;
  stages: GHLPipelineStage[];
}

export interface GHLPipelinesResponse {
  pipelines: GHLPipeline[];
}

export interface GHLOpportunity {
  id: string;
  name: string;
  pipelineId: string;
  pipelineStageId: string;
  monetaryValue: number;
  contactId: string;
  contactName?: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt?: string;
  status: string; // open, won, lost, abandoned
  lastActivity?: string;
}

export interface GHLOpportunitiesResponse {
  opportunities: GHLOpportunity[];
  meta: { total: number; currentPage: number; nextPage: number | null };
}

export interface CreateOpportunityData {
  pipelineId: string;
  pipelineStageId: string;
  name: string;
  contactId?: string;
  monetaryValue?: number;
  status?: string;
  assignedTo?: string;
}

export interface UpdateOpportunityData {
  stageId?: string;
  status?: string;
  monetaryValue?: number;
  name?: string;
  assignedTo?: string;
}

// ==================== NOTES ====================
export interface GHLNote {
  id: string;
  contactId: string;
  body: string;
  userId: string;
  dateAdded: string;
}

export interface GHLNotesResponse {
  notes: GHLNote[];
}

// ==================== CUSTOM FIELDS ====================
export interface GHLCustomField {
  id: string;
  name: string;
  fieldKey: string;
  dataType: string;
  placeholder?: string;
}

export interface GHLCustomFieldsResponse {
  customFields: GHLCustomField[];
}

// ==================== LOCATION ====================
export interface GHLLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  website: string;
  email?: string;
  timezone?: string;
}

export interface GHLLocationResponse {
  location: GHLLocation;
}

// ==================== CALENDARS ====================
export interface GHLCalendar {
  id: string;
  name: string;
  locationId: string;
  isActive: boolean;
}

export interface GHLCalendarsResponse {
  calendars: GHLCalendar[];
}

export interface GHLAppointment {
  id: string;
  calendarId: string;
  contactId: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
}

export interface GHLAppointmentsResponse {
  events: GHLAppointment[];
}

// ==================== FORMS ====================
export interface GHLForm {
  id: string;
  name: string;
  locationId: string;
}

export interface GHLFormsResponse {
  forms: GHLForm[];
}

export interface GHLFormSubmission {
  id: string;
  formId: string;
  contactId: string;
  data: Record<string, string>;
  createdAt: string;
}

export interface GHLFormSubmissionsResponse {
  submissions: GHLFormSubmission[];
  meta: { total: number };
}

// ==================== TAGS ====================
export interface GHLTag {
  id: string;
  name: string;
  locationId: string;
}

export interface GHLTagsResponse {
  tags: GHLTag[];
}

// ==================== OAUTH ====================
export interface GHLTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  locationId: string;
}

// ==================== WEBHOOK EVENTS ====================
export type GHLWebhookEventType =
  | "ContactCreate"
  | "ContactUpdate"
  | "ContactDelete"
  | "ContactTagUpdate"
  | "ContactDndUpdate"
  | "InboundMessage"
  | "OutboundMessage"
  | "OpportunityCreate"
  | "OpportunityStageUpdate"
  | "OpportunityStatusUpdate"
  | "OpportunityMonetaryValueUpdate"
  | "NoteCreate"
  | "TaskCreate";

export interface GHLWebhookPayload {
  type: GHLWebhookEventType;
  locationId: string;
  // GHL raw response
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}
