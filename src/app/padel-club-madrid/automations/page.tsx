"use client";

const AUTOMATIONS = [
  {
    name: "Speed to Lead",
    description: "Instant WhatsApp + email within 60 seconds of new inquiry",
    trigger: "New contact created",
    status: "active",
    channel: "WhatsApp + Email",
    stats: { triggered: 47, converted: 16, rate: 34 },
    color: "green",
  },
  {
    name: "Trial Sequence",
    description: "Reminder before trial + follow-up 24h after with membership offer",
    trigger: "Tag: trial-booked",
    status: "active",
    channel: "WhatsApp + Email",
    stats: { triggered: 23, converted: 8, rate: 35 },
    color: "purple",
  },
  {
    name: "Membership Nurture",
    description: "7-day sequence after trial — success stories, off-peak offers, limited slots",
    trigger: "Tag: trial-done",
    status: "active",
    channel: "Email + WhatsApp",
    stats: { triggered: 18, converted: 6, rate: 33 },
    color: "blue",
  },
  {
    name: "Win-back (30 Days)",
    description: "Re-engagement sequence for members with no booking in 30 days",
    trigger: "No activity: 30 days",
    status: "active",
    channel: "WhatsApp",
    stats: { triggered: 12, converted: 4, rate: 33 },
    color: "orange",
  },
  {
    name: "Appointment Reminders",
    description: "Court booking confirmation + reminder 24h and 1h before",
    trigger: "Appointment booked",
    status: "active",
    channel: "WhatsApp + SMS",
    stats: { triggered: 89, converted: 84, rate: 94 },
    color: "indigo",
  },
  {
    name: "Review Request",
    description: "Post-session review request via WhatsApp",
    trigger: "Tag: session-complete",
    status: "paused",
    channel: "WhatsApp",
    stats: { triggered: 0, converted: 0, rate: 0 },
    color: "gray",
  },
];

const COLOR_MAP: Record<string, { badge: string; border: string; dot: string }> = {
  green: { badge: "bg-green-900/50 text-green-400", border: "border-green-800/50", dot: "bg-green-400" },
  purple: { badge: "bg-purple-900/50 text-purple-400", border: "border-purple-800/50", dot: "bg-purple-400" },
  blue: { badge: "bg-blue-900/50 text-blue-400", border: "border-blue-800/50", dot: "bg-blue-400" },
  orange: { badge: "bg-orange-900/50 text-orange-400", border: "border-orange-800/50", dot: "bg-orange-400" },
  indigo: { badge: "bg-indigo-900/50 text-indigo-400", border: "border-indigo-800/50", dot: "bg-indigo-400" },
  gray: { badge: "bg-gray-800 text-gray-500", border: "border-gray-700", dot: "bg-gray-500" },
};

export default function AutomationsPage() {
  const active = AUTOMATIONS.filter((a) => a.status === "active").length;
  const totalTriggered = AUTOMATIONS.reduce((s, a) => s + a.stats.triggered, 0);
  const totalConverted = AUTOMATIONS.reduce((s, a) => s + a.stats.converted, 0);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Automations</h1>
        <p className="text-gray-400 mt-1">AI-powered sequences running 24/7</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Active Automations", value: active, sub: `${AUTOMATIONS.length - active} paused` },
          { label: "Total Triggered (30d)", value: totalTriggered, sub: "Across all sequences" },
          { label: "Conversions Generated", value: totalConverted, sub: `${Math.round((totalConverted / totalTriggered) * 100)}% avg rate` },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="text-3xl font-bold text-green-400">{s.value}</div>
            <div className="text-sm text-gray-300 mt-1">{s.label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Automation Cards */}
      <div className="space-y-4">
        {AUTOMATIONS.map((auto) => {
          const colors = COLOR_MAP[auto.color];
          return (
            <div key={auto.name} className={`bg-gray-900 border ${colors.border} rounded-xl p-5`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${colors.dot} ${auto.status === "active" ? "animate-pulse" : ""}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{auto.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${colors.badge}`}>
                        {auto.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{auto.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-500">Trigger: {auto.trigger}</span>
                      <span className="text-xs text-gray-500">Channel: {auto.channel}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-right">
                  <div>
                    <div className="text-lg font-bold">{auto.stats.triggered}</div>
                    <div className="text-xs text-gray-500">Triggered</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{auto.stats.converted}</div>
                    <div className="text-xs text-gray-500">Converted</div>
                  </div>
                  <div>
                    <div className={`text-lg font-bold ${auto.stats.rate > 30 ? "text-green-400" : "text-gray-400"}`}>
                      {auto.stats.rate}%
                    </div>
                    <div className="text-xs text-gray-500">Rate</div>
                  </div>
                  <button className={`text-xs px-3 py-1.5 rounded-lg ${
                    auto.status === "active"
                      ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}>
                    {auto.status === "active" ? "Pause" : "Activate"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
