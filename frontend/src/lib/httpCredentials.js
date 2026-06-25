// Ensures every request to OUR backend automatically carries the auth cookie,
// without having to add `withCredentials` / `credentials: "include"` to each of
// the ~240 call sites. Scoped to the backend base URL so third-party requests
// (e.g. the Google Generative AI SDK) are left untouched and don't hit CORS
// credential errors.
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL || "";

export function installCredentialedHttp() {
  // --- axios: send cookies on every request ---
  axios.defaults.withCredentials = true;

  // --- fetch: default credentials to "include" for same-backend calls only ---
  if (typeof window !== "undefined" && window.fetch && !window.__credFetchPatched) {
    const originalFetch = window.fetch.bind(window);

    const targetsBackend = (input) => {
      try {
        const url =
          typeof input === "string" ? input : input?.url ?? String(input);
        if (url.startsWith("/")) return true; // relative → our server
        return BACKEND_URL && url.startsWith(BACKEND_URL);
      } catch {
        return false;
      }
    };

    window.fetch = (input, init = {}) => {
      if (targetsBackend(input) && init.credentials === undefined) {
        init = { ...init, credentials: "include" };
      }
      return originalFetch(input, init);
    };

    window.__credFetchPatched = true;
  }
}
