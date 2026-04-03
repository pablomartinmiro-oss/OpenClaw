"use client";

import CostCentersSection from "./CostCentersSection";
import ExpenseCategoriesSection from "./ExpenseCategoriesSection";

export default function ConfigTab() {
  return (
    <div className="space-y-8">
      <CostCentersSection />
      <ExpenseCategoriesSection />
    </div>
  );
}
