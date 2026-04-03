"use client";

import { useState } from "react";
import { FileText, Image, Menu, Settings } from "lucide-react";
import PagesTab from "./_components/PagesTab";
import SlideshowTab from "./_components/SlideshowTab";
import MenuTab from "./_components/MenuTab";
import ConfigTab from "./_components/ConfigTab";

const TABS = [
  { key: "pages", label: "Paginas", icon: FileText },
  { key: "slideshow", label: "Slideshow", icon: Image },
  { key: "menu", label: "Menu", icon: Menu },
  { key: "config", label: "Configuracion", icon: Settings },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function ContenidosPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("pages");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#2D2A26]">Contenidos</h1>
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
      {activeTab === "pages" && <PagesTab />}
      {activeTab === "slideshow" && <SlideshowTab />}
      {activeTab === "menu" && <MenuTab />}
      {activeTab === "config" && <ConfigTab />}
    </div>
  );
}
