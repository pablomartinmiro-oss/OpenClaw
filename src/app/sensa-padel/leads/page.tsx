"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";

interface LeadMember {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

interface Lead {
  id: string;
  memberId: string;
  status: string;
  firstVisit: string;
  lastVisit: string;
  visitCount: number;
  followUpDate: string | null;
  notes: string | null;
  member: LeadMember;
}

const STATUS_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
  new:       { emoji: "🆕", label: "New",       color: "bg-blue-500/20 text-blue-400" },
  hot:       { emoji: "🔥", label: "Hot",       color: "bg-orange-500/20 text-orange-400" },
  cold:      { emoji: "❄️", label: "Cold",      color: "bg-gray-600/30 text-gray-400" },
  contacted: { emoji: "📞", label: "Contacted", color: "bg-purple-500/20 text-purple-400" },
  converted: { emoji: "✅", label: "Converted", color: "bg-green-500/20 text-green-400" },
};

function computeStatus(lead: Lead): string {
  if (lead.status === "contacted" || lead.status === "converted") return lead.status;
  const daysSinceLast = Math.floor((Date.now() - new Date(lead.lastVisit).getTime()) / 86400000);
  if (lead.visitCount >= 2 && daysSinceLast <= 30) return "hot";
  if (lead.visitCount === 1 && daysSinceLast <= 7) return "new";
  return "cold";
}

function isAlerted(lead: Lead): boolean {
  if (lead.status === "converted") return false;
  const daysSinceLast = Math.floor((Date.now() - new Date(lead.lastVisit).getTime()) / 86400000);
  return lead.visitCount > 1 && lead.status !== "contacted" && daysSinceLast > 7;
}

// ─── Notes Modal ──────────────────────────────────────────────────────────────
function NotesModal({ lead, onClose, onSaved }: { lead: Lead; onClose: () => void; onSaved: () => void }) {
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/sensa/leads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lead.id, notes }),
      });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="font-semibold">Notes — {lead.member.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <textarea
            value={notes} onChange={(e) => setNotes(e.target.value)}
            rows={5} placeholder="Add notes about this lead..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
          />
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-700 text-sm text-gray-300 hover:bg-gray-800 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-medium transition-colors disabled:opacity-50">
              {saving ? "Saving..." : "Save Notes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [notesLead, setNotesLead] = useState<Lead | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/sensa/leads");
      const json = await res.json();
      setLeads(json.leads ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  async function handleAction(leadId: string, status: string) {
    await fetch("/api/sensa/leads", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: leadId,
        status,
        followUpDate: status === "contacted" ? new Date(Date.now() + 7 * 86400000).toISOString() : undefined,
        convertedAt: status === "converted" ? new Date().toISOString() : undefined,
      }),
    });
    fetchLeads();
  }

  const displayedLeads = leads.filter((l) => {
    if (filter === "all") return true;
    const computed = computeStatus(l);
    return computed === filter || l.status === filter;
  });

  const alertCount = leads.filter(isAlerted).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lead Tracker</h1>
          <p className="text-gray-400 text-sm mt-1">{leads.length} leads · {alertCount > 0 && <span className="text-red-400">{alertCount} need attention</span>}</p>
        </div>
      </div>

      {alertCount > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
          <span className="text-red-400 text-lg">⚠️</span>
          <div>
            <div className="text-red-400 font-medium text-sm">{alertCount} leads need follow-up</div>
            <div className="text-red-400/70 text-xs">Visited 2+ times but not contacted in over 7 days</div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["all", "new", "hot", "cold", "contacted"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
              filter === f ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {f === "all" ? "All Leads" : (STATUS_CONFIG[f]?.emoji + " " + STATUS_CONFIG[f]?.label)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-12">Loading leads...</div>
      ) : displayedLeads.length === 0 ? (
        <div className="text-gray-500 text-center py-12">No leads in this category</div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-xs text-gray-400 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">First Visit</th>
                  <th className="px-4 py-3 text-left">Last Visit</th>
                  <th className="px-4 py-3 text-center">Visits</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Follow-up</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedLeads.map((lead) => {
                  const computed = computeStatus(lead);
                  const statusCfg = STATUS_CONFIG[computed] ?? STATUS_CONFIG.cold;
                  const alerted = isAlerted(lead);

                  return (
                    <tr
                      key={lead.id}
                      className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${alerted ? "bg-red-500/5" : ""}`}
                    >
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          {alerted && <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />}
                          {lead.member.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {lead.member.phone ? (
                          <a href={`tel:${lead.member.phone}`} className="hover:text-blue-400 transition-colors">
                            {lead.member.phone}
                          </a>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {new Date(lead.firstVisit).toLocaleDateString("es-ES")}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {new Date(lead.lastVisit).toLocaleDateString("es-ES")}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold">
                        {lead.visitCount}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.color}`}>
                          {statusCfg.emoji} {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {lead.followUpDate
                          ? new Date(lead.followUpDate).toLocaleDateString("es-ES")
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {lead.status !== "contacted" && lead.status !== "converted" && (
                            <button
                              onClick={() => handleAction(lead.id, "contacted")}
                              className="px-2.5 py-1 rounded-lg bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 text-xs transition-colors whitespace-nowrap"
                            >
                              📞 Contactado
                            </button>
                          )}
                          {lead.status !== "converted" && (
                            <button
                              onClick={() => handleAction(lead.id, "converted")}
                              className="px-2.5 py-1 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 text-xs transition-colors whitespace-nowrap"
                            >
                              Convertido ✅
                            </button>
                          )}
                          <button
                            onClick={() => setNotesLead(lead)}
                            className="px-2.5 py-1 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 text-xs transition-colors"
                          >
                            Notas
                          </button>
                        </div>
                        {lead.notes && (
                          <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">{lead.notes}</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {notesLead && (
        <NotesModal lead={notesLead} onClose={() => setNotesLead(null)} onSaved={fetchLeads} />
      )}
    </div>
  );
}
