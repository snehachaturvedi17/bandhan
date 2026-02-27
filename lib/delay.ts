/**
 * Bandhan AI - Delay Utility
 * Simulates realistic network delays for demo mode
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface DelayOptions {
  min?: number;
  max?: number;
  fixed?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Delay Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a promise that resolves after specified delay
 * @param ms - Delay in milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create random delay within range (simulates network latency)
 * @param options - Delay configuration
 */
export function randomDelay(options: DelayOptions = {}): Promise<void> {
  const { min = 300, max = 800, fixed } = options;

  const delayMs = fixed ?? Math.floor(Math.random() * (max - min + 1) + min);
  return delay(delayMs);
}

/**
 * API call delay (300-800ms)
 */
export function apiDelay(): Promise<void> {
  return randomDelay({ min: 300, max: 800 });
}

/**
 * Message delivery delay (200ms)
 */
export function messageDelay(): Promise<void> {
  return delay(200);
}

/**
 * Match processing delay (1s)
 */
export function matchDelay(): Promise<void> {
  return delay(1000);
}

/**
 * Upload progress simulation
 * @param onProgress - Progress callback (0-100)
 * @param totalMs - Total upload time in ms
 */
export async function uploadDelay(
  onProgress: (progress: number) => void,
  totalMs: number = 2000
): Promise<void> {
  const startTime = Date.now();

  return new Promise((resolve) => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / totalMs) * 100));

      onProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        resolve();
      }
    }, 50);
  });
}

/**
 * Typing indicator delay (simulates user typing)
 */
export function typingDelay(textLength: number): Promise<void> {
  // ~50ms per character
  const delayMs = Math.min(2000, Math.max(500, textLength * 50));
  return delay(delayMs);
}

export default {
  delay,
  randomDelay,
  apiDelay,
  messageDelay,
  matchDelay,
  uploadDelay,
  typingDelay,
};
