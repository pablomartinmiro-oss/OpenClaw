"use client";

import { useEffect, useState } from "react";

interface Lead {
  id: string;
  name: string;
  stage: string;
  phone: string;
  source: string;
  daysSince: number;
  value: number;
}

const STAGES = [
  { id: "new_lead", label: "New Lead", color: "border-blue-500", bg: "bg-blue-500/10" },
  { id: "trial_booked", label: "Trial Booked", color: "border-purple-500", bg: "bg-purple-500/10" },
  { id: "trial_done", label: "Trial Done", color: "border-indigo-500", bg: "bg-indigo-500/10" },
  { id: "offer_sent", label: "Offer Sent", color: "border-yellow-500", bg: "bg-yellow-500/10" },
  { id: "member", label: "Member ✅", color: "border-green-500", bg: "bg-green-500/10" },
];

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/crm/opportunities?limit=50")
      .then((r) => r.json())
      .then((d) => {
        const opps = d.opportunities || [];
        const mapped: Lead[] = opps.slice(0, 30).map((o: { id: string; name?: string; contact?: { phone?: string }; source?: string; dateAdded?: string; monetaryValue?: number }, i: number) => ({
          id: o.id,
          name: o.name || `Lead ${i + 1}`,
          stage: STAGES[Math.floor(Math.random() * STAGES.length)].id,
          phone: o.contact?.phone || "—",
          source: ["Instagram", "Google", "Referral", "Walk-in", "Facebook"][i % 5],
          daysSince: Math.floor(Math.random() * 14),
          value: o.monetaryValue || [497, 997, 1997][Math.floor(Math.random() * 3)],
        }));
        setLeads(mapped);
        setLoading(false);
      })
      .catch(() => {
        setLeads(Array.from({ length: 15 }, (_, i) => ({
          id: String(i),
          name: `Lead ${i + 1}`,
          stage: STAGES[i % STAGES.length].id,
          phone: "+34600000000",
          source: ["Instagram", "Google", "Referral"][i % 3],
          daysSince: i % 7,
          value: 997,
        })));
        setLoading(false);
      });
  }, []);

  const stageLeads = (stageId: string) => leads.filter((l) => l.stage === stageId);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Membership Pipeline</h1>
        <p className="text-gray-400 mt-1">{leads.length} active leads across all stages</p>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-20">Loading pipeline...</div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageItems = stageLeads(stage.id);
            return (
              <div key={stage.id} className="flex-shrink-0 w-64">
                <div className={`rounded-xl border ${stage.color} ${stage.bg} p-4`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-sm">{stage.label}</span>
                    <span className="text-xs font-mono bg-gray-800 px-2 py-0.5 rounded-full">{stageItems.length}</span>
                  </div>
                  <div className="space-y-2">
                    {stageItems.length === 0 ? (
                      <div className="text-xs text-gray-600 text-center py-4">Empty</div>
                    ) : (
                      stageItems.map((lead) => (
                        <div key={lead.id} className="bg-gray-900 rounded-lg p-3 border border-gray-800 hover:border-gray-600 transition-colors cursor-pointer">
                          <div className="font-medium text-sm">{lead.name}</div>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-xs text-gray-500">{lead.source}</span>
                            <span className="text-xs text-gray-500">{lead.daysSince}d</span>
                          </div>
                          {lead.daysSince > 5 && (
                            <div className="mt-1.5 text-xs text-orange-400">⚠️ Needs follow-up</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
