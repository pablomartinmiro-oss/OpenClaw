"use client";

import { useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle } from "lucide-react";

export function PriceImportCard() {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    // Shell only — full parsing in future iteration
  };

  return (
    <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-coral" />
          <h3 className="text-lg font-semibold text-text-primary">Importar Tarifas</h3>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <p className="text-sm text-text-secondary">
          Sube un archivo Excel o CSV con los precios de tus productos. El sistema analizará el archivo y te mostrará
          una vista previa antes de aplicar los cambios.
        </p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-10 transition-colors ${
            dragOver ? "border-coral bg-coral-light/20" : "border-border bg-surface/30"
          }`}
        >
          <Upload className="h-8 w-8 text-text-secondary mb-3" />
          <p className="text-sm font-medium text-text-primary">
            Arrastra un archivo aquí o haz clic para seleccionar
          </p>
          <p className="text-xs text-text-secondary mt-1">
            Formatos admitidos: .xlsx, .csv
          </p>
          <label className="mt-4 cursor-pointer rounded-lg border border-coral px-4 py-2 text-sm font-medium text-coral hover:bg-coral-light transition-colors">
            Seleccionar archivo
            <input type="file" accept=".xlsx,.csv" className="hidden" onChange={() => {}} />
          </label>
        </div>

        {/* Import history placeholder */}
        <div className="rounded-lg border border-border p-4">
          <h4 className="text-sm font-semibold text-text-primary mb-2">Historial de importaciones</h4>
          <div className="text-sm text-text-secondary flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-sage" />
            Sin importaciones previas
          </div>
        </div>

        <p className="text-xs text-text-secondary italic">
          La importación masiva estará disponible próximamente. Mientras tanto, puedes editar los precios
          directamente en el Catálogo de Productos.
        </p>
      </div>
    </div>
  );
}
