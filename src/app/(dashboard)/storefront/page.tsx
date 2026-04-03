"use client";

import { useState } from "react";
import { Tag, Ticket } from "lucide-react";
import DiscountCodesTab from "./_components/DiscountCodesTab";
import VouchersTab from "./_components/VouchersTab";

const TABS = [
  { key: "codes", label: "Codigos Descuento", icon: Tag },
  { key: "vouchers", label: "Bonos Compensacion", icon: Ticket },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function StorefrontPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("codes");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#2D2A26]">
          Tienda Online
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
      {activeTab === "codes" && <DiscountCodesTab />}
      {activeTab === "vouchers" && <VouchersTab />}
    </div>
  );
}
