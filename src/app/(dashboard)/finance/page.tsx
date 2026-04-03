"use client";

import { useState } from "react";
import { BarChart3, Receipt, CreditCard, Settings2 } from "lucide-react";
import DashboardTab from "./_components/DashboardTab";
import InvoicesTab from "./_components/InvoicesTab";
import ExpensesTab from "./_components/ExpensesTab";
import ConfigTab from "./_components/ConfigTab";

const TABS = [
  { key: "dashboard", label: "Resumen", icon: BarChart3 },
  { key: "invoices", label: "Facturas", icon: Receipt },
  { key: "expenses", label: "Gastos", icon: CreditCard },
  { key: "config", label: "Configuración", icon: Settings2 },
] as const;

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#2D2A26]">Finanzas</h1>
      <div className="flex gap-1 border-b border-[#E8E4DE]">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-[#E87B5A] text-[#E87B5A]"
                  : "border-transparent text-[#8A8580] hover:text-[#2D2A26] hover:border-[#E8E4DE]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
      {activeTab === "dashboard" && <DashboardTab />}
      {activeTab === "invoices" && <InvoicesTab />}
      {activeTab === "expenses" && <ExpensesTab />}
      {activeTab === "config" && <ConfigTab />}
    </div>
  );
}
