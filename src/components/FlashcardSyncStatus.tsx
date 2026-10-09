import { Cloud, CloudOff, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SyncStatus } from "@/hooks/useAccountSync";

export function FlashcardSyncStatus({ status, lastSynced, onRetry }: {
  status: SyncStatus; lastSynced: Date | null; onRetry: () => void;
}) {
  const failed = status === "error" || status === "offline";
  const Icon = status === "saving" ? Loader2 : failed ? CloudOff : Cloud;
  return <div role="status" aria-live="polite" className="flex flex-wrap items-center gap-x-3 gap-y-2 border border-border bg-card px-4 py-3 text-sm">
    <Icon size={18} className={status === "saving" ? "shrink-0 animate-spin text-primary" : failed ? "shrink-0 text-destructive" : "shrink-0 text-primary"} aria-hidden="true" />
    <div className="min-w-0 flex-1">
      <p className={failed ? "text-destructive" : "text-foreground"}>
        {status === "saving" ? "Salvando e sincronizando…" : status === "offline" ? "Sem conexão — alterações pendentes" : status === "error" ? "Falha na sincronização — tente novamente" : "Salvo na conta · sincronização atualizada"}
      </p>
      {status === "synced" && lastSynced && <p className="text-xs text-muted-foreground">Última sincronização: {lastSynced.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>}
      {failed && <p className="text-xs text-muted-foreground">Mantenha esta página aberta para reenviar as alterações.</p>}
    </div>
    <Button variant="outline" size="sm" disabled={status === "saving"} onClick={onRetry}>
      <RefreshCw size={16} className="mr-2" />{failed ? "Tentar novamente" : "Atualizar"}
    </Button>
  </div>;
}