export const CacheKeys = {
  contacts: (tenantId: string) => `t:${tenantId}:contacts`,
  contact: (tenantId: string, id: string) => `t:${tenantId}:contact:${id}`,
  conversations: (tenantId: string) => `t:${tenantId}:conversations`,
  conversation: (tenantId: string, id: string) => `t:${tenantId}:conv:${id}`,
  pipelines: (tenantId: string) => `t:${tenantId}:pipelines`,
  opportunities: (tenantId: string, pipelineId: string) =>
    `t:${tenantId}:opps:${pipelineId}`,
  unreadCount: (tenantId: string, userId: string) =>
    `t:${tenantId}:unread:${userId}`,
};

export const CacheTTL = {
  contacts: 300,       // 5 minutes
  contact: 300,        // 5 minutes
  conversations: 60,   // 1 minute
  conversation: 30,    // 30 seconds
  pipelines: 3600,     // 1 hour
  opportunities: 120,  // 2 minutes
} as const;
