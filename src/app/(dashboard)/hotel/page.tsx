"use client";

import { useState } from "react";
import { BedDouble, CalendarRange, Euro, ShieldBan } from "lucide-react";
import RoomTypesTab from "./_components/RoomTypesTab";
import SeasonsTab from "./_components/SeasonsTab";
import RatesTab from "./_components/RatesTab";
import BlocksTab from "./_components/BlocksTab";

const TABS = [
  { key: "rooms", label: "Habitaciones", icon: BedDouble },
  { key: "seasons", label: "Temporadas", icon: CalendarRange },
  { key: "rates", label: "Tarifas", icon: Euro },
  { key: "blocks", label: "Bloqueos", icon: ShieldBan },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function HotelPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("rooms");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#2D2A26]">
          Gestion Hotelera
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
      {activeTab === "rooms" && <RoomTypesTab />}
      {activeTab === "seasons" && <SeasonsTab />}
      {activeTab === "rates" && <RatesTab />}
      {activeTab === "blocks" && <BlocksTab />}
    </div>
  );
}
