"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Client } from "@/hooks/useClients";
import { useUpdateClient } from "@/hooks/useClients";
import { SKI_LEVELS, CLIENT_LANGUAGES, SOURCES, STATIONS_LIST } from "./constants";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid grid-cols-3 items-center gap-2">
      <span className="text-xs font-medium text-[#8A8580]">{label}</span>
      <div className="col-span-2">{children}</div>
    </label>
  );
}

const FIELDS_KEYS = [
  "name",
  "email",
  "phone",
  "dni",
  "birthDate",
  "address",
  "language",
  "conversionSource",
  "skiLevel",
  "preferredStation",
] as const;

export function ProfileTab({ client }: { client: Client }) {
  const update = useUpdateClient();
  const [form, setForm] = useState(() => initial(client));

  useEffect(() => {
    setForm(initial(client));
  }, [client]);

  function set<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function dirty(): boolean {
    const orig = initial(client);
    return FIELDS_KEYS.some((k) => form[k] !== orig[k]);
  }

  function handleSave() {
    if (!form.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    update.mutate(
      {
        id: client.id,
        name: form.name.trim(),
        email: emptyToNull(form.email),
        phone: emptyToNull(form.phone),
        dni: emptyToNull(form.dni),
        birthDate: form.birthDate ? new Date(form.birthDate).toISOString() : null,
        address: emptyToNull(form.address),
        language: (form.language || null) as Client["language"],
        conversionSource: emptyToNull(form.conversionSource),
        skiLevel: (form.skiLevel || null) as Client["skiLevel"],
        preferredStation: emptyToNull(form.preferredStation),
      },
      {
        onSuccess: () => toast.success("Cliente actualizado"),
        onError: () => toast.error("Error al actualizar"),
      }
    );
  }

  return (
    <div className="space-y-3">
      <Row label="Nombre *">
        <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
      </Row>
      <Row label="Email">
        <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
      </Row>
      <Row label="Teléfono">
        <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
      </Row>
      <Row label="DNI">
        <Input value={form.dni} onChange={(e) => set("dni", e.target.value)} />
      </Row>
      <Row label="F. Nacimiento">
        <Input type="date" value={form.birthDate} onChange={(e) => set("birthDate", e.target.value)} />
      </Row>
      <Row label="Dirección">
        <Input value={form.address} onChange={(e) => set("address", e.target.value)} />
      </Row>
      <Row label="Idioma">
        <Select value={form.language} onChange={(v) => set("language", v)} placeholder="Sin especificar">
          {CLIENT_LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </Select>
      </Row>
      <Row label="Fuente">
        <Select value={form.conversionSource} onChange={(v) => set("conversionSource", v)} placeholder="Sin especificar">
          {SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </Row>
      <Row label="Nivel ski">
        <Select value={form.skiLevel} onChange={(v) => set("skiLevel", v)} placeholder="Sin especificar">
          {SKI_LEVELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </Select>
      </Row>
      <Row label="Estación favorita">
        <Select
          value={form.preferredStation}
          onChange={(v) => set("preferredStation", v)}
          placeholder="Sin especificar"
        >
          {STATIONS_LIST.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </Row>

      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSave}
          disabled={!dirty() || update.isPending}
          className="bg-[#E87B5A] text-white hover:bg-[#D56E4F]"
        >
          {update.isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}

function Select({
  value,
  onChange,
  placeholder,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full rounded-[10px] border border-[#E8E4DE] bg-white px-3 text-sm text-[#2D2A26] focus:border-[#E87B5A] focus:outline-none"
    >
      <option value="">{placeholder}</option>
      {children}
    </select>
  );
}

function initial(client: Client) {
  return {
    name: client.name ?? "",
    email: client.email ?? "",
    phone: client.phone ?? "",
    dni: client.dni ?? "",
    birthDate: client.birthDate ? client.birthDate.split("T")[0] : "",
    address: client.address ?? "",
    language: client.language ?? "",
    conversionSource: client.conversionSource ?? "",
    skiLevel: client.skiLevel ?? "",
    preferredStation: client.preferredStation ?? "",
  };
}

function emptyToNull(v: string): string | null {
  const trimmed = v.trim();
  return trimmed ? trimmed : null;
}
