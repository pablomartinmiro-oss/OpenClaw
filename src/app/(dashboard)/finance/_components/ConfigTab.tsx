"use client";

import CostCentersSection from "./CostCentersSection";
import ExpenseCategoriesSection from "./ExpenseCategoriesSection";
import ExpenseSuppliersSection from "./ExpenseSuppliersSection";

export default function ConfigTab() {
  return (
    <div className="space-y-8">
      <CostCentersSection />
      <ExpenseCategoriesSection />
      <ExpenseSuppliersSection />
    </div>
  );
}
