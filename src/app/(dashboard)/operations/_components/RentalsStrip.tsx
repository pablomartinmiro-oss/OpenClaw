"use client";

import { ArrowDownToLine, ArrowUpFromLine, Snowflake, MapPin } from "lucide-react";
import type { OperationsRentals, RentalLite } from "@/hooks/useBookingOps";

interface Props {
  data?: OperationsRentals;
}

export default function RentalsStrip({ data }: Props) {
  const pickups = data?.pickups ?? [];
  const returns = data?.returns ?? [];

  if (pickups.length === 0 && returns.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Column
        title="Recogidas hoy"
        icon={<ArrowDownToLine className="h-4 w-4 text-[#5B8C6D]" />}
        accent="border-l-[#5B8C6D]"
        orders={pickups}
        emptyText="Sin recogidas"
      />
      <Column
        title="Devoluciones hoy"
        icon={<ArrowUpFromLine className="h-4 w-4 text-[#E87B5A]" />}
        accent="border-l-[#E87B5A]"
        orders={returns}
        emptyText="Sin devoluciones"
      />
    </div>
  );
}

function Column({
  title,
  icon,
  accent,
  orders,
  emptyText,
}: {
  title: string;
  icon: React.ReactNode;
  accent: string;
  orders: RentalLite[];
  emptyText: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[#E8E4DE] bg-white overflow-hidden border-l-4 ${accent}`}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-[#FAF9F7] border-b border-[#E8E4DE]">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold text-[#2D2A26]">{title}</span>
        </div>
        <span className="text-xs text-[#8A8580]">{orders.length}</span>
      </div>
      <div className="p-3 space-y-2 max-h-[260px] overflow-y-auto">
        {orders.length === 0 ? (
          <p className="text-xs text-[#8A8580] text-center py-4">{emptyText}</p>
        ) : (
          orders.map((o) => <RentalRow key={o.id} order={o} />)
        )}
      </div>
    </div>
  );
}

function RentalRow({ order }: { order: RentalLite }) {
  return (
    <div className="rounded-xl border border-[#E8E4DE] p-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-[#2D2A26] truncate">
          {order.clientName}
        </p>
        <span className="flex items-center gap-1 text-[10px] font-medium text-[#2D2A26] rounded-md bg-[#FAF9F7] border border-[#E8E4DE] px-1.5 py-0.5 shrink-0">
          <Snowflake className="h-3 w-3 text-blue-500" />
          {order.itemCount}
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-[#8A8580] mt-1">
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {order.stationSlug}
        </span>
        <span className="capitalize">{order.status}</span>
      </div>
    </div>
  );
}
