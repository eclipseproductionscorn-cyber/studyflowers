import { useCallback, useRef, useState } from "react";

export type SyncStatus = "synced" | "saving" | "error" | "offline";
type Result = { error: unknown };
type Operation = () => PromiseLike<Result>;

/** Serializes writes; a failed write blocks later writes until an explicit retry. */
export function useAccountSync() {
  const [status, setStatus] = useState<SyncStatus>("saving");
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const queue = useRef<{ operation: Operation; resolve: (result: Result | null) => void }[]>([]);
  const busy = useRef(false);
  const blocked = useRef(false);

  const drain = useCallback(async () => {
    if (busy.current || blocked.current) return;
    busy.current = true;
    setStatus("saving");
    try {
      while (queue.current.length) {
        const item = queue.current[0];
        try {
          const result = await item.operation();
          if (result.error) throw result.error;
          queue.current.shift();
          item.resolve(result);
        } catch {
          blocked.current = true;
          queue.current.forEach(pending => pending.resolve(null));
          setStatus(navigator.onLine ? "error" : "offline");
          return;
        }
      }
      setStatus("synced");
      setLastSynced(new Date());
    } finally {
      busy.current = false;
    }
  }, []);

  const run = useCallback(<T extends Result>(operation: () => PromiseLike<T>): Promise<T | null> => {
    return new Promise(resolve => {
      queue.current.push({ operation, resolve: result => resolve(result as T | null) });
      if (blocked.current) resolve(null);
      else void drain();
    });
  }, [drain]);

  const retry = useCallback(async () => {
    blocked.current = false;
    await drain();
    return !blocked.current && queue.current.length === 0;
  }, [drain]);

  const hasPending = useCallback(() => busy.current || queue.current.length > 0, []);
  return { status, lastSynced, run, retry, hasPending };
}