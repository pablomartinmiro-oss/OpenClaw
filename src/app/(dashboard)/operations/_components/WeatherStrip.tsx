"use client";

import { useMemo } from "react";
import {
  Cloud,
  CloudSnow,
  Sun,
  Wind,
  AlertTriangle,
  Eye,
  Thermometer,
} from "lucide-react";

interface StationWeather {
  slug: string;
  label: string;
  temperatureC: number;
  conditions: "soleado" | "nublado" | "nevando" | "ventoso";
  windKmh: number;
  visibilityM: number;
  snowDepthCm: number;
}

const STATIONS: { slug: string; label: string }[] = [
  { slug: "baqueira", label: "Baqueira Beret" },
  { slug: "sierra_nevada", label: "Sierra Nevada" },
  { slug: "formigal", label: "Formigal" },
  { slug: "la_pinilla", label: "La Pinilla" },
];

// TODO: replace with real weather API (AEMET or OpenWeather) once API key configured.
function mockWeatherFor(slug: string, dateISO: string): StationWeather {
  const seed = `${slug}-${dateISO}`
    .split("")
    .reduce((s, c) => s + c.charCodeAt(0), 0);
  const conditionsList: StationWeather["conditions"][] = [
    "soleado",
    "nublado",
    "nevando",
    "ventoso",
  ];
  const conditions = conditionsList[seed % conditionsList.length];
  const tempBase = -3 + (seed % 8);
  const wind = 10 + (seed % 70);
  const visibility = 100 + ((seed * 37) % 5000);
  const snow = 30 + (seed % 90);
  return {
    slug,
    label: STATIONS.find((s) => s.slug === slug)?.label ?? slug,
    temperatureC: tempBase,
    conditions,
    windKmh: wind,
    visibilityM: visibility,
    snowDepthCm: snow,
  };
}

const CONDITION_ICONS: Record<StationWeather["conditions"], React.ReactNode> = {
  soleado: <Sun className="h-4 w-4 text-[#D4A853]" />,
  nublado: <Cloud className="h-4 w-4 text-[#8A8580]" />,
  nevando: <CloudSnow className="h-4 w-4 text-blue-500" />,
  ventoso: <Wind className="h-4 w-4 text-[#5B8C6D]" />,
};

const CONDITION_LABELS: Record<StationWeather["conditions"], string> = {
  soleado: "Soleado",
  nublado: "Nublado",
  nevando: "Nevando",
  ventoso: "Ventoso",
};

interface Props {
  date: string;
}

export default function WeatherStrip({ date }: Props) {
  const weather = useMemo(
    () => STATIONS.map((s) => mockWeatherFor(s.slug, date)),
    [date]
  );

  const alerts = weather.filter(
    (w) => w.visibilityM < 200 || w.windKmh > 60
  );

  return (
    <div className="space-y-3">
      {alerts.length > 0 && (
        <div className="rounded-2xl border border-[#C75D4A]/30 bg-[#C75D4A]/5 px-5 py-3 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-[#C75D4A] mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#C75D4A]">
              Alerta meteorologica
            </p>
            <p className="text-xs text-[#2D2A26] mt-0.5">
              {alerts
                .map(
                  (a) =>
                    `${a.label}: ${
                      a.windKmh > 60 ? `viento ${a.windKmh} km/h` : ""
                    }${a.windKmh > 60 && a.visibilityM < 200 ? ", " : ""}${
                      a.visibilityM < 200 ? `visibilidad ${a.visibilityM} m` : ""
                    }`
                )
                .join(" · ")}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {weather.map((w) => {
          const isAlert = w.visibilityM < 200 || w.windKmh > 60;
          return (
            <div
              key={w.slug}
              className={`rounded-2xl border bg-white px-4 py-3 ${
                isAlert
                  ? "border-[#C75D4A]/30"
                  : "border-[#E8E4DE]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-[#2D2A26] truncate">
                  {w.label}
                </p>
                {CONDITION_ICONS[w.conditions]}
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-xl font-bold text-[#2D2A26]">
                  {w.temperatureC}°
                </span>
                <span className="text-xs text-[#8A8580]">
                  {CONDITION_LABELS[w.conditions]}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-[#8A8580]">
                <span className="flex items-center gap-1">
                  <Wind className="h-3 w-3" />
                  {w.windKmh} km/h
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {w.visibilityM >= 1000
                    ? `${(w.visibilityM / 1000).toFixed(1)} km`
                    : `${w.visibilityM} m`}
                </span>
                <span className="flex items-center gap-1">
                  <Thermometer className="h-3 w-3" />
                  {w.snowDepthCm} cm
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
