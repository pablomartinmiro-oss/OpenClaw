"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Warehouse,
  UserRound,
} from "lucide-react";
import PanelTab from "./_components/PanelTab";
import OrdersTab from "./_components/OrdersTab";
import InventoryTab from "./_components/InventoryTab";
import ProfilesTab from "./_components/ProfilesTab";

const TABS = [
  { key: "panel", label: "Panel", icon: LayoutDashboard },
  { key: "pedidos", label: "Pedidos", icon: ClipboardList },
  { key: "inventario", label: "Inventario", icon: Warehouse },
  { key: "perfiles", label: "Perfiles", icon: UserRound },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function AlquilerPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("panel");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#2D2A26]">
          Alquiler de Material
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
      {activeTab === "panel" && <PanelTab />}
      {activeTab === "pedidos" && <OrdersTab />}
      {activeTab === "inventario" && <InventoryTab />}
      {activeTab === "perfiles" && <ProfilesTab />}
    </div>
  );
}
