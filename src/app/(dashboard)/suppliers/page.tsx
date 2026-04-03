"use client";

import { useState } from "react";
import { Truck, FileText } from "lucide-react";
import SuppliersTab from "./_components/SuppliersTab";
import SettlementsTab from "./_components/SettlementsTab";

const TABS = [
  { key: "suppliers", label: "Proveedores", icon: Truck },
  { key: "settlements", label: "Liquidaciones", icon: FileText },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function SuppliersPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("suppliers");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#2D2A26]">
          Proveedores y Liquidaciones
        </h1>
      </div>

      {/* Tab navigation */}
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

      {/* Tab content */}
      {activeTab === "suppliers" && <SuppliersTab />}
      {activeTab === "settlements" && <SettlementsTab />}
    </div>
  );
}
