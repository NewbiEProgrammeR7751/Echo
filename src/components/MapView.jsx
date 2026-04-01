import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useGeolocation } from "@/hooks/useGeolocation";
import { listLatestPosts } from "@/lib/posts";

// Fix missing default marker icons in many bundlers
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker,
  shadowUrl: markerShadow,
});

function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (!center) return;
    map.flyTo(center, Math.max(map.getZoom(), 14), { animate: true, duration: 0.6 });
  }, [map, center]);
  return null;
}

export default function MapView() {
  const geo = useGeolocation();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState("");

  const maptilerKey = import.meta.env.VITE_MAPTILER_KEY;
  const tileUrl = useMemo(() => {
    if (!maptilerKey) return null;
    return `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${maptilerKey}`;
  }, [maptilerKey]);

  const initialCenter = useMemo(() => [20, 0], []); // world view fallback
  const userCenter = geo.position ? [geo.position.lat, geo.position.lng] : null;

  useEffect(() => {
    let cancelled = false;
    setLoadingPosts(true);
    setPostsError("");
    listLatestPosts({ max: 200 })
      .then((items) => {
        if (cancelled) return;
        setPosts(items);
      })
      .catch((err) => {
        if (cancelled) return;
        setPostsError(err?.message ?? "Could not load posts.");
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingPosts(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const pinnedPosts = useMemo(() => {
    return posts.filter(
      (p) =>
        typeof p?.location?.lat === "number" &&
        typeof p?.location?.lng === "number",
    );
  }, [posts]);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Map</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void geo.refresh()}
            className="rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80 hover:bg-white/5"
            disabled={geo.loading}
            title={geo.error || ""}
          >
            {geo.loading ? "Locating…" : geo.position ? "My location" : "Enable location"}
          </button>
        </div>
      </div>

      {!tileUrl ? (
        <div className="mt-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-100">
          Missing <code className="text-yellow-50">VITE_MAPTILER_KEY</code>. Add it to your
          <code className="ml-1 text-yellow-50">.env</code> file (see
          <code className="ml-1 text-yellow-50">.env.example</code>), then restart
          <code className="ml-1 text-yellow-50">npm run dev</code>.
        </div>
      ) : null}

      {postsError ? (
        <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {postsError}
        </div>
      ) : null}

      <div className="mt-3 overflow-hidden rounded-lg border border-white/10">
        <div className="h-[420px] w-full">
          <MapContainer
            center={userCenter ?? initialCenter}
            zoom={userCenter ? 13 : 2}
            scrollWheelZoom
            style={{ height: "100%", width: "100%" }}
          >
            {tileUrl ? (
              <TileLayer
                url={tileUrl}
                attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
            ) : null}

            {userCenter ? (
              <>
                <FlyTo center={userCenter} />
                <Marker position={userCenter}>
                  <Popup>You are here.</Popup>
                </Marker>
              </>
            ) : null}

            {pinnedPosts.map((p) => (
              <Marker key={p.id} position={[p.location.lat, p.location.lng]}>
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold">{p.authorName ?? "Anonymous"}</div>
                    <div className="mt-1 whitespace-pre-wrap">{p.text}</div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      <div className="mt-3 text-xs text-white/50">
        {loadingPosts ? "Loading posts…" : `${pinnedPosts.length} pinned posts on map.`}
      </div>
    </div>
  );
}

