// Offline demo-mode visibility store.
// The API layer falls back to bundled sample profiles when the backend is
// unreachable. That fallback keeps the UI explorable, but it must never be
// silent: this store records every fallback so the UI can label the data.

let state = {
  offline: false,
  endpoints: [],
};

const listeners = new Set();

const notify = () => {
  for (const listener of listeners) {
    listener(state);
  }
};

export const markOfflineFallback = (endpoint) => {
  if (state.endpoints.includes(endpoint)) {
    if (!state.offline) {
      state = { ...state, offline: true };
      notify();
    }
    return;
  }
  state = {
    offline: true,
    endpoints: [...state.endpoints, endpoint],
  };
  notify();
};

export const getOfflineState = () => state;

export const subscribeOfflineMode = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// Test helper: restore the pristine "backend answers normally" state.
export const resetOfflineMode = () => {
  state = { offline: false, endpoints: [] };
  notify();
};
