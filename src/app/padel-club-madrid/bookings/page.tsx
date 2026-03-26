"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const COURTS = ["Court 1", "Court 2", "Court 3", "Court 4", "Court 5", "Court 6"];
const HOURS = Array.from({ length: 14 }, (_, i) => `${i + 8}:00`); // 8am - 9pm

const MOCK_BOOKINGS: Array<{ court: number; hour: number; name: string; type: string }> = [
  { court: 0, hour: 9, name: "Carlos M.", type: "member" },
  { court: 0, hour: 10, name: "Ana L.", type: "trial" },
  { court: 1, hour: 8, name: "Grupo Lunes", type: "clinic" },
  { court: 1, hour: 9, name: "Grupo Lunes", type: "clinic" },
  { court: 2, hour: 11, name: "Pedro R.", type: "member" },
  { court: 3, hour: 17, name: "María G.", type: "member" },
  { court: 3, hour: 18, name: "Javier S.", type: "lead" },
  { court: 4, hour: 19, name: "Liga Martes", type: "league" },
  { court: 4, hour: 20, name: "Liga Martes", type: "league" },
  { court: 5, hour: 18, name: "Luis P.", type: "member" },
  { court: 5, hour: 19, name: "Rosa T.", type: "trial" },
];

const TYPE_COLORS: Record<string, string> = {
  member: "bg-green-900/70 border-green-700 text-green-300",
  trial: "bg-purple-900/70 border-purple-700 text-purple-300",
  clinic: "bg-blue-900/70 border-blue-700 text-blue-300",
  league: "bg-yellow-900/70 border-yellow-700 text-yellow-300",
  lead: "bg-orange-900/70 border-orange-700 text-orange-300",
};

export default function BookingsPage() {
  const [selectedDate] = useState(new Date());

  const bookedCount = MOCK_BOOKINGS.length;
  const totalSlots = COURTS.length * HOURS.length;
  const utilization = Math.round((bookedCount / totalSlots) * 100);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Court Bookings</h1>
          <p className="text-gray-400 mt-1">
            {bookedCount} bookings today · {utilization}% utilization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium">
            {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </span>
          <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Utilization bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Court utilization</span>
            <span>{utilization}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: `${utilization}%` }} />
          </div>
        </div>
        <div className="flex gap-3 text-xs">
          {Object.entries(TYPE_COLORS).map(([type, cls]) => (
            <div key={type} className="flex items-center gap-1">
              <div className={`w-2.5 h-2.5 rounded-sm border ${cls}`} />
              <span className="capitalize text-gray-400">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-4 py-3 text-xs text-gray-500 w-16">Time</th>
              {COURTS.map((c) => (
                <th key={c} className="text-center px-2 py-3 text-xs text-gray-500 w-28">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour, hIdx) => (
              <tr key={hour} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                <td className="px-4 py-2 text-xs text-gray-500 font-mono">{hour}</td>
                {COURTS.map((_, cIdx) => {
                  const booking = MOCK_BOOKINGS.find((b) => b.court === cIdx && b.hour === hIdx + 8);
                  return (
                    <td key={cIdx} className="px-1 py-1 text-center">
                      {booking ? (
                        <div className={`rounded px-2 py-1 text-xs border cursor-pointer hover:opacity-80 ${TYPE_COLORS[booking.type]}`}>
                          <div className="font-medium truncate">{booking.name}</div>
                        </div>
                      ) : (
                        <div className="h-7 rounded border border-dashed border-gray-800 hover:border-green-700 cursor-pointer transition-colors" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
