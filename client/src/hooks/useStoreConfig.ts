import { useState, useEffect } from "react";
import { api } from "@/api/client";
import type { StoreSettings } from "@/types";

let cachedConfig: StoreSettings | null = null;
const listeners = new Set<() => void>();

export function setCachedStoreConfig(cfg: StoreSettings) {
  cachedConfig = cfg;
  listeners.forEach((l) => l());
}

export function useStoreConfig() {
  const [config, setConfig] = useState<StoreSettings>(
    cachedConfig ?? {
      freeDeliveryThreshold: 999,
      minOrderAmount: 199,
      storeName: "Gharmai Kirana — Birgunj",
      storePhone: "+977-9807281806",
      openHours: "6:00 AM – 9:00 PM",
    }
  );

  useEffect(() => {
    let active = true;
    const update = () => {
      if (cachedConfig && active) setConfig(cachedConfig);
    };
    listeners.add(update);

    if (!cachedConfig) {
      api
        .get<StoreSettings>("/api/config")
        .then((data) => {
          if (data && active) {
            cachedConfig = data;
            setConfig(data);
            listeners.forEach((l) => l());
          }
        })
        .catch(() => {
          // Fall back gracefully to defaults
        });
    }

    return () => {
      active = false;
      listeners.delete(update);
    };
  }, []);

  return config;
}
