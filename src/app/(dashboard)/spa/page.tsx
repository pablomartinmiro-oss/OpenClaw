"use client";

import { useState } from "react";
import { Sparkles, Users, Clock, CalendarDays } from "lucide-react";
import TreatmentsTab from "./_components/TreatmentsTab";
import ResourcesTab from "./_components/ResourcesTab";
import SlotsTab from "./_components/SlotsTab";
import ScheduleTab from "./_components/ScheduleTab";

const TABS = [
  { key: "treatments", label: "Tratamientos", icon: Sparkles },
  { key: "resources", label: "Recursos", icon: Users },
  { key: "slots", label: "Horarios", icon: Clock },
  { key: "schedule", label: "Plantilla Semanal", icon: CalendarDays },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function SpaPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("treatments");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#2D2A26]">
          Gestion Spa
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
      {activeTab === "treatments" && <TreatmentsTab />}
      {activeTab === "resources" && <ResourcesTab />}
      {activeTab === "slots" && <SlotsTab />}
      {activeTab === "schedule" && <ScheduleTab />}
    </div>
  );
}
