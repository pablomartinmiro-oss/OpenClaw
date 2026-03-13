// GHL API response types

export interface GHLContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  tags: string[];
  source: string | null;
  dateAdded: string;
  customFields?: Record<string, string>;
}

export interface GHLContactsResponse {
  contacts: GHLContact[];
  meta: { total: number; currentPage: number; nextPage: number | null };
}

export interface GHLConversation {
  id: string;
  contactId: string;
  contactName: string;
  lastMessageBody: string;
  lastMessageDate: string;
  unreadCount: number;
  assignedTo: string | null;
  type: string;
}

export interface GHLConversationsResponse {
  conversations: GHLConversation[];
  total: number;
}

export interface GHLMessage {
  id: string;
  conversationId: string;
  contactId: string;
  body: string;
  direction: "inbound" | "outbound";
  status: string;
  dateAdded: string;
  messageType: string;
}

export interface GHLMessagesResponse {
  messages: GHLMessage[];
  nextPage: string | null;
}

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
  assignedTo: string | null;
  createdAt: string;
  status: string;
}

export interface GHLOpportunitiesResponse {
  opportunities: GHLOpportunity[];
  meta: { total: number; currentPage: number; nextPage: number | null };
}

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

export interface GHLTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  locationId: string;
}

export interface GHLLocationResponse {
  location: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    phone: string;
    website: string;
  };
}
