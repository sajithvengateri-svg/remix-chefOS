import { useState, useEffect, useCallback } from "react";

const SETTINGS_KEY = "chefos_app_settings";

export interface AppSettings {
  // Appearance
  theme: "light" | "dark" | "system";
  compactMode: boolean;
  animationsEnabled: boolean;
  
  // Image Optimization
  autoCompressImages: boolean;
  imageQuality: "low" | "medium" | "high";
  maxImageSize: "1024" | "1600" | "2048";
  
  // Notifications
  pushNotifications: boolean;
  emailNotifications: boolean;
  prepListReminders: boolean;
  expiryAlerts: boolean;
  
  // Units
  weightUnit: "metric" | "imperial";
  volumeUnit: "metric" | "imperial";
  temperatureUnit: "celsius" | "fahrenheit";
  currency: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
  
  // Tax/Costing
  defaultGstPercent: number;
  defaultFoodCostTarget: number;
  
  // Privacy
  showProfileToTeam: boolean;
  showActivityStatus: boolean;
  shareAnalytics: boolean;
  sessionTimeout: string;
}

const defaultSettings: AppSettings = {
  // Appearance
  theme: "system",
  compactMode: false,
  animationsEnabled: true,
  
  // Image Optimization
  autoCompressImages: true,
  imageQuality: "medium",
  maxImageSize: "1600",
  
  // Notifications
  pushNotifications: true,
  emailNotifications: true,
  prepListReminders: true,
  expiryAlerts: true,
  
  // Units
  weightUnit: "metric",
  volumeUnit: "metric",
  temperatureUnit: "celsius",
  currency: "AUD",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24h",
  
  // Tax/Costing
  defaultGstPercent: 10,
  defaultFoodCostTarget: 30,
  
  // Privacy
  showProfileToTeam: true,
  showActivityStatus: true,
  shareAnalytics: false,
  sessionTimeout: "4h",
};

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window === "undefined") return defaultSettings;
    
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return { ...defaultSettings, ...parsed };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      return newSettings;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    localStorage.removeItem(SETTINGS_KEY);
  }, []);

  // Apply theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === "dark") {
      root.classList.add("dark");
    } else if (settings.theme === "light") {
      root.classList.remove("dark");
    } else {
      // System preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [settings.theme]);

  return {
    settings,
    updateSettings,
    resetSettings,
    defaultSettings,
  };
};

// Image compression utility
export const compressImage = async (
  file: File, 
  settings: Pick<AppSettings, "autoCompressImages" | "imageQuality" | "maxImageSize">
): Promise<File> => {
  if (!settings.autoCompressImages) return file;
  
  const qualityMap = { low: 0.5, medium: 0.7, high: 0.9 };
  const quality = qualityMap[settings.imageQuality];
  const maxSize = parseInt(settings.maxImageSize);
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    img.onload = () => {
      let { width, height } = img;
      
      // Resize if larger than max size
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height / width) * maxSize;
          width = maxSize;
        } else {
          width = (width / height) * maxSize;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        "image/jpeg",
        quality
      );
    };
    
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};
