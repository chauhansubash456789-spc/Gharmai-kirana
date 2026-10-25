import { useState, useCallback } from "react";
import { Crosshair, Loader2, AlertCircle, CheckCircle, MapPin } from "lucide-react";

interface AddressComponents {
  province?: string;
  district?: string;
  municipality?: string;
  ward?: string;
  tole?: string;
  landmark?: string;
  formattedAddress?: string;
}

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number) => void;
  onAddressChange?: (address: AddressComponents) => void;
}

export function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
  onAddressChange,
}: LocationPickerProps) {
  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "Click the button to auto-detect your location." });
  const [isLocating, setIsLocating] = useState(false);

  const parseNominatimAddress = useCallback((address: Record<string, string>): AddressComponents => {
    const province = address.state || address.province || "";
    const district = address.county || address.district || address.city_district || "";
    const municipality = address.city || address.town || address.municipality || address.village || "";
    const ward = address.ward || address.suburb || address.neighbourhood || "";
    const tole = address.road || address.street || address.trail || address.path || "";
    const landmark = address.house_number || address.building || address.place_of_worship || address.tourism || "";

    let formattedParts: string[] = [];
    if (tole) formattedParts.push(tole);
    if (ward) formattedParts.push(`Ward ${ward}`);
    if (municipality) formattedParts.push(municipality);
    if (district) formattedParts.push(district);
    if (province) formattedParts.push(province);
    const formattedAddress = formattedParts.join(", ");

    return {
      province,
      district,
      municipality,
      ward,
      tole,
      landmark,
      formattedAddress,
    };
  }, []);

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<AddressComponents | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`,
        { headers: { "User-Agent": "GharmaiKirana/1.0" } }
      );
      if (!response.ok) throw new Error("Reverse geocoding failed");
      const data = await response.json();
      if (!data.address) throw new Error("No address data returned");
      return parseNominatimAddress(data.address);
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      return null;
    }
  }, [parseNominatimAddress]);

  const handleLocate = useCallback(async () => {
    if (!navigator.geolocation) {
      setStatus({ type: "error", message: "Geolocation is not supported by this browser." });
      return;
    }

    setIsLocating(true);
    setStatus({ type: "loading", message: "Detecting location…" });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;

        onLocationChange(lat, lng);

        setStatus({ type: "loading", message: "Resolving address…" });

        const addressData = await reverseGeocode(lat, lng);

        if (addressData) {
          onAddressChange?.(addressData);
          setStatus({
            type: "success",
            message: `Location detected (±${Math.round(accuracy)}m) — address auto-filled.`,
          });
        } else {
          setStatus({
            type: "success",
            message: `GPS locked (±${Math.round(accuracy)}m). Please fill address manually.`,
          });
        }

        setIsLocating(false);
      },
      (err) => {
        let msg = "Could not get your GPS location. Please fill address manually.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "Location permission denied. Please enable location access or fill address manually.";
        } else if (err.code === err.TIMEOUT) {
          msg = "Location request timed out. Please fill address manually.";
        }
        setStatus({ type: "error", message: msg });
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [onLocationChange, onAddressChange, reverseGeocode]);

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
              Detecting location…
            </>
          ) : (
            <>
              <Crosshair className="me-1" size={14} />
              Detect my location
            </>
          )}
        </button>
      </div>

      <div className="row g-2 mt-2">
        <input
          type="hidden"
          name="latitude"
          id="lat"
          value={latitude ? latitude.toFixed(7) : ""}
        />
        <input
          type="hidden"
          name="longitude"
          id="lng"
          value={longitude ? longitude.toFixed(7) : ""}
        />
        <div className="col-md-6">
          <input
            type="text"
            name="landmark"
            className="form-control form-control-sm"
            placeholder="Landmark / nearby feature (optional)"
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