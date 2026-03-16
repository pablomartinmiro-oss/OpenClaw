"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

interface SyncStatus {
  lastFullSync: string | null;
  lastIncrSync: string | null;
  contactCount: number;
  conversationCount: number;
  opportunityCount: number;
  pipelineCount: number;
  syncInProgress: boolean;
}

interface DataModeCardProps {
  dataMode: "mock" | "live";
  ghlConnected: boolean;
  loading: boolean;
  onToggle: (mode: "mock" | "live") => void;
  isPending: boolean;
  syncStatus?: SyncStatus | null;
}

export function DataModeCard({ dataMode, ghlConnected, loading, onToggle, isPending, syncStatus }: DataModeCardProps) {
  const [syncing, setSyncing] = useState(false);

  if (loading) {
    return (
      <div className="mb-6 animate-pulse rounded-lg border border-border bg-white p-6">
        <div className="h-6 w-48 rounded bg-gray-200" />
        <div className="mt-2 h-4 w-64 rounded bg-gray-200" />
      </div>
    );
  }

  const isMock = dataMode === "mock";
  const lastSync = syncStatus?.lastFullSync ?? syncStatus?.lastIncrSync;

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      await fetch("/api/admin/ghl/full-sync", { method: "POST" });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="mb-6 rounded-lg border border-border bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Modo de datos</h2>
          <div className="mt-1 flex items-center gap-2">
            {isMock ? (
              <span className="inline-flex items-center rounded-full bg-sage-light px-2.5 py-0.5 text-xs font-medium text-sage">
                Modo demo activo
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-soft-blue-light px-2.5 py-0.5 text-xs font-medium text-soft-blue">
                Conectado a GHL
              </span>
            )}
            {syncStatus?.syncInProgress && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gold-light px-2.5 py-0.5 text-xs font-medium text-gold">
                <Loader2 className="h-3 w-3 animate-spin" />
                Sincronizando...
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            {isMock
              ? "Estás viendo datos de ejemplo. Conecta GoHighLevel y activa el modo real para ver tus datos."
              : "Los datos se obtienen de tu cuenta de GoHighLevel en tiempo real."}
          </p>
          {!isMock && !ghlConnected && (
            <p className="mt-1 text-sm font-medium text-muted-red">
              Conecta tu cuenta de GoHighLevel primero
            </p>
          )}

          {/* Sync status info */}
          {!isMock && syncStatus && (
            <div className="mt-3 space-y-1 text-xs text-text-secondary">
              {lastSync && (
                <p>
                  Última sincronización:{" "}
                  <span className="font-medium text-text-primary">
                    {new Date(lastSync).toLocaleString("es-ES")}
                  </span>
                </p>
              )}
              <p>
                {syncStatus.contactCount.toLocaleString("es-ES")} contactos ·{" "}
                {syncStatus.pipelineCount} pipelines ·{" "}
                {syncStatus.opportunityCount} oportunidades ·{" "}
                {syncStatus.conversationCount} conversaciones
              </p>
            </div>
          )}
        </div>

        <div className="ml-4 flex flex-col items-center gap-2">
          <Button
            variant={isMock ? "default" : "outline"}
            size="sm"
            disabled={isPending || (!ghlConnected && isMock)}
            onClick={() => onToggle(isMock ? "live" : "mock")}
            className="min-w-[140px]"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isMock ? "Activar modo real" : "Volver a demo"}
          </Button>
          {isMock && !ghlConnected && (
            <span className="text-[10px] text-muted-foreground">Conecta GHL primero</span>
          )}

          {/* Manual sync button */}
          {!isMock && (
            <Button
              variant="outline"
              size="sm"
              disabled={syncing || syncStatus?.syncInProgress}
              onClick={handleManualSync}
              className="min-w-[140px]"
            >
              {syncing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Sincronizar ahora
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
