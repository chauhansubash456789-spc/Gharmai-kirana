import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Crosshair, MapPin, Loader2, AlertCircle, CheckCircle } from "lucide-react";

const BIRGUNJ_CENTER: [number, number] = [27.0414, 84.8722];

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number) => void;
  height?: number;
  zoom?: number;
}

export function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
  height = 280,
  zoom = 14,
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "Tap the map to place the pin manually if GPS is unavailable." });
  const [isLocating, setIsLocating] = useState(false);

  const initializeMap = useCallback(() => {
    if (mapInstanceRef.current || !mapRef.current) return;

    const map = L.map(mapRef.current, {
      center: latitude && longitude ? [latitude, longitude] : BIRGUNJ_CENTER,
      zoom: latitude && longitude ? zoom : 12,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapInstanceRef.current = map;

    setTimeout(() => map.invalidateSize(), 200);

    if (latitude && longitude) {
      addMarker(latitude, longitude);
      map.setView([latitude, longitude], zoom);
    }

    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      addMarker(lat, lng);
      onLocationChange(lat, lng);
      setStatus({ type: "success", message: `Pinned at ${lat.toFixed(7)}, ${lng.toFixed(7)}` });
    });
  }, [latitude, longitude, zoom, onLocationChange]);

  const addMarker = (lat: number, lng: number) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const marker = L.marker([lat, lng], { draggable: true }).addTo(mapInstanceRef.current!);
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onLocationChange(pos.lat, pos.lng);
        setStatus({ type: "success", message: `Pinned at ${pos.lat.toFixed(7)}, ${pos.lng.toFixed(7)}` });
      });
      markerRef.current = marker;
    }
  };

  useEffect(() => {
    initializeMap();
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [initializeMap]);

  useEffect(() => {
    if (mapInstanceRef.current && latitude && longitude) {
      addMarker(latitude, longitude);
      mapInstanceRef.current.setView([latitude, longitude], zoom);
    }
  }, [latitude, longitude, zoom]);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setStatus({ type: "error", message: "Geolocation is not supported by this browser." });
      return;
    }

    setIsLocating(true);
    setStatus({ type: "loading", message: "Locating…" });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        addMarker(lat, lng);
        onLocationChange(lat, lng);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
        }
        setStatus({
          type: "success",
          message: `GPS locked with ±${Math.round(accuracy)} m accuracy.`,
        });
        setIsLocating(false);
      },
      (err) => {
        let msg = "Could not get your GPS location. Please tap the map to pin it manually.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "Location permission denied. Please enable location access or tap the map manually.";
        } else if (err.code === err.TIMEOUT) {
          msg = "Location request timed out. Please tap the map to pin it manually.";
        }
        setStatus({ type: "error", message: msg });
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="border rounded-3 p-3 mb-3 bg-light">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="fw-semibold">
          <MapPin className="text-danger me-1" size={16} />
          Location *
        </span>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          id="locate-btn"
          onClick={handleLocate}
          disabled={isLocating}
        >
          {isLocating ? (
            <>
              <Loader2 className="me-1 animate-spin" size={14} />
              Locating…
            </>
          ) : (
            <>
              <Crosshair className="me-1" size={14} />
              Detect my location
            </>
          )}
        </button>
      </div>

      <div
        ref={mapRef}
        id="location-map"
        className="rounded-3"
        style={{ height, width: "100%", zIndex: 1 }}
      />

      <div className="row g-2 mt-2">
        <div className="col-6 col-md-3">
          <input
            type="text"
            name="latitude"
            id="lat"
            className="form-control form-control-sm"
            placeholder="Latitude"
            readOnly
            value={latitude ? latitude.toFixed(7) : ""}
            required
          />
        </div>
        <div className="col-6 col-md-3">
          <input
            type="text"
            name="longitude"
            id="lng"
            className="form-control form-control-sm"
            placeholder="Longitude"
            readOnly
            value={longitude ? longitude.toFixed(7) : ""}
            required
          />
        </div>
        <div className="col-md-6">
          <input
            type="text"
            name="landmark"
            className="form-control form-control-sm"
            placeholder="Landmark / address (optional)"
          />
        </div>
      </div>

      <div id="gps-status" className={`small mt-1 ${status.type === "error" ? "text-danger" : status.type === "success" ? "text-success" : "text-muted"}`}>
        {status.type === "loading" && <Loader2 className="me-1 animate-spin" size={12} />}
        {status.type === "success" && <CheckCircle className="me-1" size={12} />}
        {status.type === "error" && <AlertCircle className="me-1" size={12} />}
        {status.message}
      </div>
    </div>
  );
}