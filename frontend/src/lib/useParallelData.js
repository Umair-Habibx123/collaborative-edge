import { useState, useEffect, useCallback } from "react";

const BASE = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL || "";

// Fetches multiple endpoints in PARALLEL with Promise.all and parses JSON
// concurrently, so total latency ≈ the slowest request instead of the sum.
// Requests are aborted on unmount / dependency change to avoid state updates
// on stale responses. Credentials are sent automatically (see httpCredentials).
//
//   const { data, loading, error, refetch } = useParallelData({
//     completion: `/student/SelectionCompletion/${email}`,
//     ratings:    `/student/StudentRatings/${email}`,
//   }, [email]);
//
// `data` is keyed by the same keys: { completion, ratings }.
export function useParallelData(endpoints, deps = [], { enabled = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  // Stable serialization so the effect re-runs only when endpoints change.
  const keys = Object.keys(endpoints);
  const urls = Object.values(endpoints);

  const run = useCallback(
    async (signal) => {
      if (!enabled) return;
      setLoading(true);
      setError(null);
      try {
        const responses = await Promise.all(
          urls.map((u) =>
            fetch(u.startsWith("http") ? u : `${BASE}${u}`, { signal, credentials: "include" })
          )
        );
        // Parse JSON regardless of status code. Endpoints like the dashboard
        // metrics return 404 with a meaningful body when a user has no records
        // yet — that's expected data, not a hard error. We surface HTTP errors
        // via `error` but still expose whatever body came back as `data`.
        const payloads = await Promise.all(
          responses.map((r) => r.json().catch(() => null))
        );
        const failed = responses.find((r) => !r.ok);
        if (failed) setError(new Error(`HTTP ${failed.status}`));
        const result = {};
        keys.forEach((k, i) => (result[k] = payloads[i]));
        setData(result);
      } catch (err) {
        if (err.name !== "AbortError") setError(err);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabled, ...deps]
  );

  useEffect(() => {
    const controller = new AbortController();
    run(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  const refetch = useCallback(() => run(), [run]);

  return { data, loading, error, refetch };
}
