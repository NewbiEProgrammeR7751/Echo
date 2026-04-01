import { useCallback, useEffect, useState } from "react";

export function useGeolocation({ enableHighAccuracy = true } = {}) {
  const [permissionState, setPermissionState] = useState("unknown"); // unknown | granted | denied | prompt
  const [position, setPosition] = useState(null); // { lat, lng, accuracy, timestamp }
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported on this device.");
      setPermissionState("denied");
      return null;
    }

    setLoading(true);
    setError("");

    const result = await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          const coords = p.coords;
          resolve({
            ok: true,
            value: {
              lat: coords.latitude,
              lng: coords.longitude,
              accuracy: coords.accuracy,
              timestamp: p.timestamp,
            },
          });
        },
        (e) => resolve({ ok: false, error: e }),
        { enableHighAccuracy, timeout: 15000, maximumAge: 30000 },
      );
    });

    if (result.ok) {
      setPosition(result.value);
      setPermissionState("granted");
      setLoading(false);
      return result.value;
    }

    const code = result.error?.code;
    if (code === 1) setPermissionState("denied");
    else setPermissionState("prompt");
    setError(result.error?.message ?? "Could not get location.");
    setLoading(false);
    return null;
  }, [enableHighAccuracy]);

  useEffect(() => {
    // Best-effort read permission state if supported
    if (!navigator?.permissions?.query) return;
    navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        setPermissionState(status.state);
        status.onchange = () => setPermissionState(status.state);
      })
      .catch(() => {});
  }, []);

  return { permissionState, position, error, loading, refresh };
}

