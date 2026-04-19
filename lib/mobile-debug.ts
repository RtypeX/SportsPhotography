type MobileDebugPayload = {
  event: string;
  route: string;
  search: string;
  userAgent: string;
  viewportWidth: number;
  viewportHeight: number;
  connectionType: string | null;
  effectiveConnectionType: string | null;
  saveData: boolean | null;
  timestamp: string;
  details?: Record<string, unknown>;
};

type NetworkInformationLike = {
  type?: string;
  effectiveType?: string;
  saveData?: boolean;
};

function readMobileDebugFlag() {
  if (typeof window === "undefined") {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  const queryValue = params.get("mobileDebug");

  if (queryValue === "1") {
    window.localStorage.setItem("mobileDebug", "1");
    return true;
  }

  if (queryValue === "0") {
    window.localStorage.removeItem("mobileDebug");
    return false;
  }

  return window.localStorage.getItem("mobileDebug") === "1";
}

function getNetworkInformation() {
  if (typeof navigator === "undefined") {
    return {
      connectionType: null,
      effectiveConnectionType: null,
      saveData: null,
    };
  }

  const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;

  return {
    connectionType: connection?.type ?? null,
    effectiveConnectionType: connection?.effectiveType ?? null,
    saveData: connection?.saveData ?? null,
  };
}

export function reportMobileDebug(event: string, details?: Record<string, unknown>) {
  if (typeof window === "undefined" || !readMobileDebugFlag()) {
    return;
  }

  const payload: MobileDebugPayload = {
    event,
    route: window.location.pathname,
    search: window.location.search,
    userAgent: window.navigator.userAgent,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    timestamp: new Date().toISOString(),
    details,
    ...getNetworkInformation(),
  };

  console.warn("[mobile-debug]", payload);

  const body = JSON.stringify(payload);

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/mobile-debug", blob);
      return;
    }
  } catch {
    // Fall back to fetch below if sendBeacon is not available.
  }

  void fetch("/api/mobile-debug", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
    keepalive: true,
  }).catch(() => {
    // Ignore logging errors to avoid impacting gallery use.
  });
}
