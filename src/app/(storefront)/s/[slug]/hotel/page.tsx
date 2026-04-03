"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "../_components/CartContext";
import { formatEUR } from "../_components/utils";

interface RoomType {
  id: string;
  title: string;
  slug: string;
  capacity: number;
  basePrice: number;
  description: string | null;
  images: string[];
}

export default function HotelPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  useEffect(() => {
    fetch(`/api/storefront/public/${slug}/rooms`)
      .then((r) => r.json())
      .then((data) => setRooms(data.roomTypes ?? []))
      .catch(() => {
        // silent
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleBook = (room: RoomType) => {
    addItem({
      id: `room-${room.id}`,
      type: "room",
      name: room.title,
      price: room.basePrice,
      meta: { checkIn, checkOut, guests: String(guests) },
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Hotel
        </h1>
        <p className="text-gray-500">
          Elige tu habitacion ideal y disfruta de la montana.
        </p>
      </div>

      {/* Date & guest selectors */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entrada
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E87B5A]/30 focus:border-[#E87B5A]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salida
            </label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn || undefined}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E87B5A]/30 focus:border-[#E87B5A]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Huespedes
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setGuests(Math.max(1, guests - 1))}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-lg"
              >
                -
              </button>
              <span className="text-sm font-semibold text-gray-900 min-w-[2rem] text-center">
                {guests}
              </span>
              <button
                onClick={() => setGuests(Math.min(10, guests + 1))}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-lg"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Room cards */}
      {loading ? (
        <RoomSkeleton />
      ) : rooms.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image placeholder */}
              <div className="aspect-[16/9] bg-gray-100 flex items-center justify-center">
                <BedIcon />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {room.title}
                </h3>
                {room.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {room.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <PersonIcon /> Hasta {room.capacity} {room.capacity === 1 ? "huesped" : "huespedes"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-bold text-gray-900">
                      {formatEUR(room.basePrice)}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">/ noche</span>
                  </div>
                  <button
                    onClick={() => handleBook(room)}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-[#E87B5A] rounded-lg hover:bg-[#D56E4F] transition-colors"
                  >
                    Reservar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 text-gray-500">
      <BedIcon large />
      <p className="text-lg mt-4">No hay habitaciones disponibles.</p>
      <p className="text-sm mt-1">Consulta de nuevo mas adelante.</p>
    </div>
  );
}

function RoomSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white overflow-hidden animate-pulse">
          <div className="aspect-[16/9] bg-gray-100" />
          <div className="p-5 space-y-3">
            <div className="h-5 w-1/2 bg-gray-100 rounded" />
            <div className="h-4 w-3/4 bg-gray-100 rounded" />
            <div className="h-4 w-1/3 bg-gray-100 rounded" />
            <div className="flex justify-between pt-2">
              <div className="h-6 w-24 bg-gray-100 rounded" />
              <div className="h-10 w-24 bg-gray-100 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BedIcon({ large }: { large?: boolean }) {
  const size = large ? 48 : 40;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={large ? "#d1d5db" : "#9ca3af"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={large ? "mx-auto" : ""}>
      <path d="M2 4v16M22 4v16M2 12h20M2 20h20M6 12V8a2 2 0 012-2h8a2 2 0 012 2v4" />
      <circle cx="9" cy="9" r="1" />
      <circle cx="15" cy="9" r="1" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
