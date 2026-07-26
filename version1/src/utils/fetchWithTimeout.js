/**
 * Promise timeout helper — prevents infinite loading spinners.
 */
export function fetchWithTimeout(promise, ms = 20000, label = 'Request') {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)
    }),
  ])
}