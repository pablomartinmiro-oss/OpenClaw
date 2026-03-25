"use client";

import { useEffect, useState } from "react";
import { PRICING_TIERS } from "@/lib/config/pricing";

interface ClientStats {
  contacts: number;
  opportunities: number;
  conversations: number;
  wonOpportunities: number;
  winRate: number;
}

interface Client {
  id: string;
  name: string;
  slug: string;
  syncState: string | null;
  lastSyncAt: string | null;
  ghlLocationId: string | null;
  isDemo: boolean;
  isActive: boolean;
  stats: ClientStats;
}

export default function AgencyPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agency/clients")
      .then((r) => r.json())
      .then((d) => {
        setClients(d.clients || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalContacts = clients.reduce((s, c) => s + c.stats.contacts, 0);
  const totalOpps = clients.reduce((s, c) => s + c.stats.opportunities, 0);
  const activeClients = clients.filter((c) => c.isActive && !c.isDemo).length;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Viddix AI — Agency Overview</h1>
          <p className="text-gray-400 mt-1">All clients, all performance, one view</p>
        </div>
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2"
          onClick={() => alert("Coming soon — trigger onboarding for new client")}
        >
          + Add Client
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Clients", value: activeClients, color: "text-indigo-400" },
          { label: "Total Contacts", value: totalContacts.toLocaleString(), color: "text-green-400" },
          { label: "Total Opportunities", value: totalOpps.toLocaleString(), color: "text-purple-400" },
          { label: "Avg Win Rate", value: clients.length ? Math.round(clients.reduce((s, c) => s + c.stats.winRate, 0) / clients.length) + "%" : "0%", color: "text-yellow-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Clients Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="font-semibold text-lg">All Clients</h2>
          <span className="text-gray-400 text-sm">{clients.length} total</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading clients...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase border-b border-gray-800">
                <th className="text-left px-6 py-3">Client</th>
                <th className="text-right px-6 py-3">Contacts</th>
                <th className="text-right px-6 py-3">Opportunities</th>
                <th className="text-right px-6 py-3">Win Rate</th>
                <th className="text-left px-6 py-3">Sync</th>
                <th className="text-left px-6 py-3">Last Sync</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${client.isActive ? "bg-green-400" : "bg-gray-600"}`} />
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-xs text-gray-500">{client.slug}{client.isDemo ? " · demo" : ""}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono">{client.stats.contacts.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-mono">{client.stats.opportunities.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-mono ${client.stats.winRate > 20 ? "text-green-400" : "text-gray-400"}`}>
                      {client.stats.winRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      client.syncState === "complete" ? "bg-green-900/50 text-green-400" :
                      client.syncState === "error" ? "bg-red-900/50 text-red-400" :
                      "bg-gray-800 text-gray-500"
                    }`}>
                      {client.syncState || "not synced"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {client.lastSyncAt ? new Date(client.lastSyncAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={`/${client.slug}`}
                      className="text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      View →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pricing Tiers */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-5">Pricing Tiers</h2>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(PRICING_TIERS).map(([key, tier]) => (
            <div key={key} className={`bg-gray-900 border rounded-xl p-6 ${(tier as any).popular ? "border-indigo-500" : "border-gray-800"}`}>
              {(tier as any).popular && (
                <div className="text-xs text-indigo-400 font-medium mb-2">MOST POPULAR</div>
              )}
              <div className="text-xl font-bold">{tier.name}</div>
              <div className="mt-2">
                <span className="text-3xl font-bold">${tier.price}</span>
                <span className="text-gray-500">/mo</span>
              </div>
              <div className="text-sm text-gray-500 mt-1">+${tier.setupFee} setup</div>
              <div className="text-sm text-gray-400 mt-3">{tier.description}</div>
              <ul className="mt-4 space-y-2">
                {tier.features.map((f) => (
                  <li key={f} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
# deploy Wed Mar 25 17:18:15 CDT 2026
