export const PRICING_TIERS = {
  starter: {
    name: "Starter",
    price: 497,
    setupFee: 997,
    description: "Perfect for small businesses getting started with automation",
    features: [
      "GHL subaccount setup",
      "Universal sales pipeline",
      "5 core automations",
      "Email follow-up sequences",
      "Monthly performance report",
      "Speed-to-lead (60 sec response)",
      "Review request automation",
    ],
    snapshotFeatures: [
      "universal_pipeline",
      "speed_to_lead",
      "follow_up_sequence",
      "review_request",
      "basic_custom_fields",
    ],
    color: "#6366f1",
  },
  growth: {
    name: "Growth",
    price: 997,
    setupFee: 1997,
    description: "For businesses ready to scale with paid ads and AI",
    features: [
      "Everything in Starter",
      "Meta/Facebook ads integration",
      "AI caller setup (speed-to-lead calls)",
      "Custom industry dashboard",
      "Weekly performance report",
      "WhatsApp automation",
      "Appointment booking funnel",
      "Lead scoring",
    ],
    snapshotFeatures: [
      "starter_features",
      "meta_ads_intake",
      "ai_caller",
      "custom_dashboard",
      "whatsapp_automation",
      "appointment_funnel",
      "lead_scoring",
    ],
    color: "#8b5cf6",
    popular: true,
  },
  scale: {
    name: "Scale",
    price: 1997,
    setupFee: 2997,
    description: "Full-stack AI operations for serious growth",
    features: [
      "Everything in Growth",
      "Full custom build (industry-specific)",
      "Dedicated AI agent monitoring",
      "Daily performance report",
      "Priority support (2hr response)",
      "Quarterly strategy session",
      "Multi-location support",
      "Advanced analytics + ROI tracking",
    ],
    snapshotFeatures: [
      "all_features",
      "custom_build",
      "dedicated_monitoring",
      "advanced_analytics",
      "multi_location",
    ],
    color: "#ec4899",
  },
} as const;

export type PricingTier = keyof typeof PRICING_TIERS;

export function getTierByPrice(monthlyPrice: number): PricingTier {
  if (monthlyPrice <= 500) return "starter";
  if (monthlyPrice <= 1000) return "growth";
  return "scale";
}
