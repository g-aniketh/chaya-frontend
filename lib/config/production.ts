// Production configuration and constants
export const PRODUCTION_CONFIG = {
  // API Configuration
  API: {
    BASE_URL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000",
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
  },

  // Cache Configuration
  CACHE: {
    DEFAULT_TTL: 300, // 5 minutes
    MAX_ITEMS: 1000,
    CLEANUP_INTERVAL: 60000, // 1 minute
  },

  // Performance Configuration
  PERFORMANCE: {
    DEBOUNCE_DELAY: 300, // 300ms
    THROTTLE_DELAY: 1000, // 1 second
    LAZY_LOAD_THRESHOLD: 100, // pixels
    IMAGE_QUALITY: 80,
    IMAGE_FORMATS: ["webp", "avif", "jpeg"],
  },

  // Security Configuration
  SECURITY: {
    CSRF_TOKEN_HEADER: "X-CSRF-Token",
    RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: 100,
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Feature Flags
  FEATURES: {
    ENABLE_ANALYTICS: process.env.NODE_ENV === "production",
    ENABLE_ERROR_REPORTING: process.env.NODE_ENV === "production",
    ENABLE_PERFORMANCE_MONITORING: process.env.NODE_ENV === "production",
    ENABLE_OFFLINE_SUPPORT: true,
    ENABLE_PUSH_NOTIFICATIONS: true,
    ENABLE_DARK_MODE: true,
  },

  // UI Configuration
  UI: {
    ANIMATION_DURATION: 200, // milliseconds
    TRANSITION_DURATION: 300,
    DEBOUNCE_SEARCH: 500,
    INFINITE_SCROLL_THRESHOLD: 0.8,
    MODAL_BACKDROP_BLUR: true,
    SIDEBAR_COLLAPSED_WIDTH: 64,
    SIDEBAR_EXPANDED_WIDTH: 256,
  },

  // Form Configuration
  FORMS: {
    AUTO_SAVE_INTERVAL: 30000, // 30 seconds
    VALIDATION_DEBOUNCE: 500,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_FILE_TYPES: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
    MAX_FILES_PER_UPLOAD: 5,
  },

  // Table Configuration
  TABLES: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
    MAX_PAGE_SIZE: 100,
    SORT_DEBOUNCE: 300,
    FILTER_DEBOUNCE: 500,
  },

  // Notification Configuration
  NOTIFICATIONS: {
    AUTO_DISMISS_DELAY: 5000, // 5 seconds
    MAX_NOTIFICATIONS: 5,
    POSITION: "top-right",
    ENABLE_SOUND: false,
  },

  // Error Handling
  ERRORS: {
    MAX_RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    SHOW_ERROR_DETAILS: process.env.NODE_ENV === "development",
    LOG_ERRORS: true,
  },

  // Accessibility
  A11Y: {
    SKIP_TO_CONTENT_ID: "main-content",
    FOCUS_VISIBLE_CLASS: "focus-visible",
    REDUCED_MOTION_QUERY: "(prefers-reduced-motion: reduce)",
    HIGH_CONTRAST_QUERY: "(prefers-contrast: high)",
  },
} as const;

// Environment-specific configurations
export const getEnvironmentConfig = () => {
  const isDevelopment = process.env.NODE_ENV === "development";
  const isProduction = process.env.NODE_ENV === "production";
  const isTest = process.env.NODE_ENV === "test";

  return {
    isDevelopment,
    isProduction,
    isTest,
    
    // Development overrides
    ...(isDevelopment && {
      API: {
        ...PRODUCTION_CONFIG.API,
        TIMEOUT: 60000, // Longer timeout for dev
      },
      PERFORMANCE: {
        ...PRODUCTION_CONFIG.PERFORMANCE,
        DEBOUNCE_DELAY: 100, // Faster for dev
      },
      ERRORS: {
        ...PRODUCTION_CONFIG.ERRORS,
        SHOW_ERROR_DETAILS: true,
      },
    }),

    // Production overrides
    ...(isProduction && {
      FEATURES: {
        ...PRODUCTION_CONFIG.FEATURES,
        ENABLE_ANALYTICS: true,
        ENABLE_ERROR_REPORTING: true,
        ENABLE_PERFORMANCE_MONITORING: true,
      },
    }),

    // Test overrides
    ...(isTest && {
      API: {
        ...PRODUCTION_CONFIG.API,
        TIMEOUT: 5000, // Shorter timeout for tests
      },
      PERFORMANCE: {
        ...PRODUCTION_CONFIG.PERFORMANCE,
        DEBOUNCE_DELAY: 0, // No debounce in tests
      },
    }),
  };
};

// Validation schemas for configuration
export const validateConfig = (config: any) => {
  const requiredFields = [
    "API.BASE_URL",
    "CACHE.DEFAULT_TTL",
    "PERFORMANCE.DEBOUNCE_DELAY",
    "SECURITY.SESSION_TIMEOUT",
  ];

  const missingFields = requiredFields.filter(field => {
    const keys = field.split(".");
    let current = config;
    for (const key of keys) {
      if (current[key] === undefined) return true;
      current = current[key];
    }
    return false;
  });

  if (missingFields.length > 0) {
    throw new Error(`Missing required configuration fields: ${missingFields.join(", ")}`);
  }

  return true;
};

// Feature flag utilities
export const isFeatureEnabled = (feature: keyof typeof PRODUCTION_CONFIG.FEATURES): boolean => {
  return PRODUCTION_CONFIG.FEATURES[feature];
};

// Performance utilities
export const getPerformanceConfig = () => PRODUCTION_CONFIG.PERFORMANCE;
export const getUIConfig = () => PRODUCTION_CONFIG.UI;
export const getFormConfig = () => PRODUCTION_CONFIG.FORMS;
export const getTableConfig = () => PRODUCTION_CONFIG.TABLES;

// Environment utilities
export const isDevelopment = () => process.env.NODE_ENV === "development";
export const isProduction = () => process.env.NODE_ENV === "production";
export const isTest = () => process.env.NODE_ENV === "test";

// URL utilities
export const getApiUrl = (endpoint: string) => {
  const baseUrl = PRODUCTION_CONFIG.API.BASE_URL;
  return `${baseUrl.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;
};

// Cache key utilities
export const getCacheKey = (prefix: string, ...parts: (string | number)[]): string => {
  return [prefix, ...parts].join(":");
};

// Error message utilities
export const getErrorMessage = (error: any): string => {
  if (typeof error === "string") return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return "An unexpected error occurred";
};

// Format utilities
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};

export const formatCurrency = (amount: number, currency = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

export const formatDate = (date: Date | string): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

export const formatDateTime = (date: Date | string): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Storage utilities
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    if (typeof window === "undefined") return defaultValue || null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch {
      return defaultValue || null;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  },

  remove: (key: string): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  },

  clear: (): void => {
    if (typeof window === "undefined") return;
    localStorage.clear();
  },
};

// Export the main configuration
export default PRODUCTION_CONFIG;
