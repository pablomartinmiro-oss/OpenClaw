"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

export interface ProductVariables {
  category: string | null;
  startDate: string | null;
  endDate: string | null;
  numDays: number | null;
  numPersons: number | null;
  ageDetails: Array<{ age: number; type: string }> | null;
  modalidad: string | null;
  nivel: string | null;
  sector: string | null;
  idioma: string | null;
  horario: string | null;
  puntoEncuentro: string | null;
  tipoCliente: string | null;
  gama: string | null;
  casco: boolean | null;
  tipoActividad: string | null;
  regimen: string | null;
  alojamientoNombre: string | null;
  seguroIncluido: boolean | null;
  notes: string | null;
}

interface Props {
  category: string | null;
  variables: ProductVariables;
  onChange: (vars: Partial<ProductVariables>) => void;
}

const INPUT_CLS = "w-full rounded-lg border border-border px-2.5 py-1.5 text-sm focus:border-coral focus:outline-none";
const SELECT_CLS = INPUT_CLS;
const LABEL_CLS = "text-xs font-medium text-text-secondary";

export function ProductVariableForm({ category, variables, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const cat = category?.toLowerCase();
  if (!cat) return null;

  const fields = getFieldsForCategory(cat);
  if (fields.length === 0) return null;

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs text-coral hover:text-coral-hover transition-colors"
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        Detalles del producto
      </button>
      {open && (
        <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg border border-border/50 bg-surface/30 p-3">
          {fields.includes("startDate") && (
            <Field label="Fecha inicio">
              <input
                type="date"
                value={variables.startDate ?? ""}
                onChange={(e) => onChange({ startDate: e.target.value || null })}
                className={INPUT_CLS}
              />
            </Field>
          )}
          {fields.includes("endDate") && (
            <Field label="Fecha fin">
              <input
                type="date"
                value={variables.endDate ?? ""}
                onChange={(e) => onChange({ endDate: e.target.value || null })}
                className={INPUT_CLS}
              />
            </Field>
          )}
          {fields.includes("numDays") && (
            <Field label="Días">
              <input
                type="number"
                min={1}
                max={14}
                value={variables.numDays ?? ""}
                onChange={(e) => onChange({ numDays: parseInt(e.target.value) || null })}
                className={INPUT_CLS}
              />
            </Field>
          )}
          {fields.includes("numPersons") && (
            <Field label="Personas">
              <input
                type="number"
                min={1}
                value={variables.numPersons ?? ""}
                onChange={(e) => onChange({ numPersons: parseInt(e.target.value) || null })}
                className={INPUT_CLS}
              />
            </Field>
          )}
          {fields.includes("tipoActividad") && (
            <Field label="Actividad">
              <select
                value={variables.tipoActividad ?? ""}
                onChange={(e) => onChange({ tipoActividad: e.target.value || null })}
                className={SELECT_CLS}
              >
                <option value="">—</option>
                <option value="esquí">Esquí</option>
                <option value="snow">Snow</option>
              </select>
            </Field>
          )}
          {fields.includes("modalidad") && (
            <Field label="Modalidad">
              <select
                value={variables.modalidad ?? ""}
                onChange={(e) => onChange({ modalidad: e.target.value || null })}
                className={SELECT_CLS}
              >
                <option value="">—</option>
                <option value="alpino">Alpino</option>
                <option value="snow">Snow</option>
              </select>
            </Field>
          )}
          {fields.includes("nivel") && (
            <Field label="Nivel">
              <select
                value={variables.nivel ?? ""}
                onChange={(e) => onChange({ nivel: e.target.value || null })}
                className={SELECT_CLS}
              >
                <option value="">—</option>
                <option value="A">A — Principiante</option>
                <option value="A+">A+ — Principiante avanzado</option>
                <option value="B">B — Intermedio</option>
                <option value="B+">B+ — Intermedio avanzado</option>
                <option value="C">C — Avanzado</option>
                <option value="D">D — Experto</option>
              </select>
            </Field>
          )}
          {fields.includes("sector") && (
            <Field label="Sector">
              <select
                value={variables.sector ?? ""}
                onChange={(e) => onChange({ sector: e.target.value || null })}
                className={SELECT_CLS}
              >
                <option value="">—</option>
                <option value="Baqueira">Baqueira</option>
                <option value="Beret">Beret</option>
                <option value="Formigal">Formigal</option>
                <option value="Sierra Nevada">Sierra Nevada</option>
              </select>
            </Field>
          )}
          {fields.includes("idioma") && (
            <Field label="Idioma">
              <select
                value={variables.idioma ?? ""}
                onChange={(e) => onChange({ idioma: e.target.value || null })}
                className={SELECT_CLS}
              >
                <option value="">—</option>
                <option value="español">Español</option>
                <option value="inglés">Inglés</option>
                <option value="francés">Francés</option>
              </select>
            </Field>
          )}
          {fields.includes("horario") && (
            <Field label="Horario">
              <select
                value={variables.horario ?? ""}
                onChange={(e) => onChange({ horario: e.target.value || null })}
                className={SELECT_CLS}
              >
                <option value="">—</option>
                <option value="10:00">10:00</option>
                <option value="13:00">13:00</option>
              </select>
            </Field>
          )}
          {fields.includes("puntoEncuentro") && (
            <Field label="Punto encuentro">
              <input
                type="text"
                value={variables.puntoEncuentro ?? ""}
                onChange={(e) => onChange({ puntoEncuentro: e.target.value || null })}
                placeholder="Ej: Escuela de esquí"
                className={INPUT_CLS}
              />
            </Field>
          )}
          {fields.includes("tipoCliente") && (
            <Field label="Tipo cliente">
              <select
                value={variables.tipoCliente ?? ""}
                onChange={(e) => onChange({ tipoCliente: e.target.value || null })}
                className={SELECT_CLS}
              >
                <option value="">—</option>
                <option value="adulto">Adulto</option>
                <option value="niño">Niño</option>
                <option value="baby">Baby</option>
                <option value="senior">Senior</option>
              </select>
            </Field>
          )}
          {fields.includes("gama") && (
            <Field label="Gama">
              <select
                value={variables.gama ?? ""}
                onChange={(e) => onChange({ gama: e.target.value || null })}
                className={SELECT_CLS}
              >
                <option value="">—</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </Field>
          )}
          {fields.includes("casco") && (
            <Field label="Casco">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={variables.casco ?? false}
                  onChange={(e) => onChange({ casco: e.target.checked })}
                  className="rounded border-border text-coral focus:ring-coral"
                />
                Incluido
              </label>
            </Field>
          )}
          {fields.includes("seguroIncluido") && (
            <Field label="Seguro">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={variables.seguroIncluido ?? false}
                  onChange={(e) => onChange({ seguroIncluido: e.target.checked })}
                  className="rounded border-border text-coral focus:ring-coral"
                />
                Incluido
              </label>
            </Field>
          )}
          {fields.includes("regimen") && (
            <Field label="Régimen">
              <select
                value={variables.regimen ?? ""}
                onChange={(e) => onChange({ regimen: e.target.value || null })}
                className={SELECT_CLS}
              >
                <option value="">—</option>
                <option value="solo_alojamiento">Solo alojamiento</option>
                <option value="desayuno">Desayuno</option>
                <option value="media_pension">Media pensión</option>
                <option value="pension_completa">Pensión completa</option>
              </select>
            </Field>
          )}
          {fields.includes("alojamientoNombre") && (
            <Field label="Alojamiento">
              <input
                type="text"
                value={variables.alojamientoNombre ?? ""}
                onChange={(e) => onChange({ alojamientoNombre: e.target.value || null })}
                placeholder="Nombre del alojamiento"
                className={INPUT_CLS}
              />
            </Field>
          )}
          {fields.includes("notes") && (
            <div className="col-span-2">
              <Field label="Notas">
                <input
                  type="text"
                  value={variables.notes ?? ""}
                  onChange={(e) => onChange({ notes: e.target.value || null })}
                  placeholder="Notas adicionales"
                  className={INPUT_CLS}
                />
              </Field>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={LABEL_CLS}>{label}</label>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

type FieldName = keyof ProductVariables;

function getFieldsForCategory(cat: string): FieldName[] {
  switch (cat) {
    case "forfait":
      return ["startDate", "numDays", "numPersons", "seguroIncluido", "notes"];
    case "alquiler":
      return ["startDate", "numDays", "tipoCliente", "tipoActividad", "gama", "casco", "notes"];
    case "clase_particular":
      return ["startDate", "numDays", "tipoActividad", "numPersons", "nivel", "horario", "sector", "puntoEncuentro", "idioma", "notes"];
    case "escuela":
      return ["startDate", "numDays", "tipoActividad", "nivel", "horario", "notes"];
    case "alojamiento":
      return ["startDate", "endDate", "numPersons", "regimen", "alojamientoNombre", "notes"];
    case "pack":
      return ["startDate", "numDays", "numPersons", "tipoActividad", "nivel", "gama", "casco", "seguroIncluido", "notes"];
    case "snowcamp":
    case "apreski":
    case "taxi":
      return ["startDate", "numPersons", "notes"];
    case "menu":
      return ["startDate", "numPersons", "notes"];
    case "locker":
      return ["startDate", "numDays", "notes"];
    default:
      return ["startDate", "numDays", "notes"];
  }
}
