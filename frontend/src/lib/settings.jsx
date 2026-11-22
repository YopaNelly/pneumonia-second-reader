import { createContext, useContext, useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";

const KEY = "second-reader-settings";
const defaults = { autoLogout: 30, reduceMotion: false, saveByDefault: true };

const SettingsContext = createContext({ settings: defaults, update: () => {} });

function load() {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return defaults;
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(settings));
    } catch {
      /* storage unavailable */
    }
    document.documentElement.classList.toggle("reduce-motion", settings.reduceMotion);
  }, [settings]);

  const update = (patch) => setSettings((s) => ({ ...s, ...patch }));

  return (
    <SettingsContext.Provider value={{ settings, update }}>
      <MotionConfig reducedMotion={settings.reduceMotion ? "always" : "user"}>{children}</MotionConfig>
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
