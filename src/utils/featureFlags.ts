/**
 * Feature flags system for safe rollback and gradual feature deployment
 */

interface FeatureFlags {
  // AI Features
  AI_LAZY_LOADING: boolean;
  AI_PERFORMANCE_MONITORING: boolean;
  AI_STREAMING: boolean;
  AI_TEMPLATE_REGISTRY: boolean;

  // UI Features
  PERFORMANCE_STATUS_DISPLAY: boolean;

  // Development Features
  DEBUG_MODE: boolean;
  MOCK_AI_CLIENT: boolean;
}

/**
 * Default feature flags configuration
 */
const DEFAULT_FLAGS: FeatureFlags = {
  // AI Features - enabled by default after optimization
  AI_LAZY_LOADING: true,
  AI_PERFORMANCE_MONITORING: true,
  AI_STREAMING: true,
  AI_TEMPLATE_REGISTRY: true,

  // UI Features
  PERFORMANCE_STATUS_DISPLAY: false, // Only show when needed

  // Development Features
  DEBUG_MODE: import.meta.env.MODE === 'development',
  MOCK_AI_CLIENT: import.meta.env.MODE === 'test',
};

/**
 * Environment-based feature flag overrides
 */
const ENV_OVERRIDES: Partial<FeatureFlags> = {
  // Production overrides
  ...(import.meta.env.MODE === 'production' && {
    DEBUG_MODE: false,
    MOCK_AI_CLIENT: false,
    PERFORMANCE_STATUS_DISPLAY: false,
  }),

  // Test overrides
  ...(import.meta.env.MODE === 'test' && {
    AI_LAZY_LOADING: true, // Keep lazy loading but with mocks
    AI_PERFORMANCE_MONITORING: false, // Disable monitoring in tests
    MOCK_AI_CLIENT: true,
  }),

  // Development overrides
  ...(import.meta.env.MODE === 'development' && {
    PERFORMANCE_STATUS_DISPLAY: true,
    DEBUG_MODE: true,
  }),
};

/**
 * Runtime feature flags (can be modified for emergency rollbacks)
 */
const runtimeFlags: Partial<FeatureFlags> = {};

/**
 * Get the current value of a feature flag
 */
export function getFeatureFlag<K extends keyof FeatureFlags>(flag: K): FeatureFlags[K] {
  // Priority: Runtime > Environment > Default
  return (runtimeFlags[flag] ?? ENV_OVERRIDES[flag] ?? DEFAULT_FLAGS[flag]) as FeatureFlags[K];
}

/**
 * Set a runtime feature flag (for emergency rollbacks)
 */
export function setFeatureFlag<K extends keyof FeatureFlags>(
  flag: K,
  value: FeatureFlags[K]
): void {
  runtimeFlags[flag] = value;

  if (getFeatureFlag('DEBUG_MODE')) {
    console.log(`Feature flag ${flag} set to:`, value);
  }
}

/**
 * Emergency rollback - disable all AI optimizations
 */
export function emergencyRollback(): void {
  console.warn('🚨 Emergency rollback activated - disabling AI optimizations');

  setFeatureFlag('AI_LAZY_LOADING', false);
  setFeatureFlag('AI_PERFORMANCE_MONITORING', false);
  setFeatureFlag('AI_TEMPLATE_REGISTRY', false);

  // Reload page to apply changes
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
}

/**
 * Get all current feature flags (for debugging)
 */
export function getAllFeatureFlags(): FeatureFlags {
  const flags = {} as FeatureFlags;

  for (const key in DEFAULT_FLAGS) {
    const flagKey = key as keyof FeatureFlags;
    flags[flagKey] = getFeatureFlag(flagKey);
  }

  return flags;
}

/**
 * Feature flag hook for React components
 */
export function useFeatureFlag<K extends keyof FeatureFlags>(flag: K): FeatureFlags[K] {
  return getFeatureFlag(flag);
}

/**
 * Conditional execution based on feature flag
 */
export function withFeatureFlag<T>(
  flag: keyof FeatureFlags,
  enabledFn: () => T,
  disabledFn?: () => T
): T | undefined {
  if (getFeatureFlag(flag)) {
    return enabledFn();
  } else if (disabledFn) {
    return disabledFn();
  }
  return undefined;
}

// Export types for external use
export type { FeatureFlags };

// Make emergency rollback available globally for debugging
if (typeof window !== 'undefined' && getFeatureFlag('DEBUG_MODE')) {
  (window as unknown as Record<string, unknown>).emergencyRollback = emergencyRollback;
  (window as unknown as Record<string, unknown>).getFeatureFlags = getAllFeatureFlags;
  (window as unknown as Record<string, unknown>).setFeatureFlag = setFeatureFlag;
}
