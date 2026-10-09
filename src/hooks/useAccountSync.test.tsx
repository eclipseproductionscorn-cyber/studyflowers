import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useAccountSync } from "./useAccountSync";

describe("account synchronization", () => {
  it("retains failed writes until retry and does not report success early", async () => {
    const operation = vi.fn().mockResolvedValueOnce({ error: new Error("network") }).mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAccountSync());
    await act(async () => { await result.current.run(operation); });
    expect(result.current.status).toBe("error");
    expect(result.current.lastSynced).toBeNull();
    await act(async () => { await result.current.retry(); });
    expect(operation).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe("synced");
    expect(result.current.lastSynced).toBeInstanceOf(Date);
  });

  it("blocks subsequent writes behind a failed write and retries in order", async () => {
    const order: string[] = [];
    let failed = true;
    const first = async () => { order.push("first"); return { error: failed ? new Error("offline") : null }; };
    const second = async () => { order.push("second"); return { error: null }; };
    const { result } = renderHook(() => useAccountSync());
    await act(async () => { await result.current.run(first); await result.current.run(second); });
    expect(order).toEqual(["first"]);
    failed = false;
    await act(async () => { await result.current.retry(); });
    expect(order).toEqual(["first", "first", "second"]);
    expect(result.current.status).toBe("synced");
  });

  it("keeps saving visible until all concurrent operations finish", async () => {
    let release: ((value: { error: null }) => void) | undefined;
    const operation = () => new Promise<{ error: null }>(resolve => { release = resolve; });
    const { result } = renderHook(() => useAccountSync());
    let pending: Promise<unknown> | undefined;
    act(() => { pending = result.current.run(operation); });
    await waitFor(() => expect(result.current.status).toBe("saving"));
    expect(result.current.lastSynced).toBeNull();
    await act(async () => { release?.({ error: null }); await pending; });
    expect(result.current.status).toBe("synced");
  });
});