"use client";

import { useState, useRef, useEffect } from "react";
import { FileText, Image, Menu, Settings, ImageIcon, Upload, Home } from "lucide-react";
import PagesTab from "./_components/PagesTab";
import SlideshowTab from "./_components/SlideshowTab";
import MenuTab from "./_components/MenuTab";
import ConfigTab from "./_components/ConfigTab";
import GalleryManager from "./_components/GalleryManager";
import MediaManager from "./_components/MediaManager";
import HomeModulesManager from "./_components/HomeModulesManager";

const TABS = [
  { key: "pages", label: "Páginas", icon: FileText },
  { key: "slideshow", label: "Slideshow", icon: Image },
  { key: "gallery", label: "Galería", icon: ImageIcon },
  { key: "media", label: "Media", icon: Upload },
  { key: "home-modules", label: "Home", icon: Home },
  { key: "menu", label: "Menú", icon: Menu },
  { key: "config", label: "Config", icon: Settings },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function ContenidosPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("pages");
  const tabsRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Scroll active tab into view on tab change (not on first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const container = tabsRef.current;
    if (!container) return;
    const activeEl = container.querySelector(`[data-tab="${activeTab}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ inline: "center", behavior: "smooth", block: "nearest" });
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#2D2A26]">Contenidos</h1>
      </div>

      {/* Tab navigation — horizontal scroll on mobile */}
      <div className="relative">
        <div ref={tabsRef} className="flex gap-1 border-b border-[#E8E4DE] overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                data-tab={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === tab.key
                    ? "border-[#E87B5A] text-[#E87B5A]"
                    : "border-transparent text-[#8A8580] hover:text-[#2D2A26] hover:border-[#E8E4DE]"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
        {/* Fade gradient on right for mobile scroll hint */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none sm:hidden" />
      </div>

      {/* Tab content */}
      {activeTab === "pages" && <PagesTab />}
      {activeTab === "slideshow" && <SlideshowTab />}
      {activeTab === "gallery" && <GalleryManager />}
      {activeTab === "media" && <MediaManager />}
      {activeTab === "home-modules" && <HomeModulesManager />}
      {activeTab === "menu" && <MenuTab />}
      {activeTab === "config" && <ConfigTab />}
    </div>
  );
}
