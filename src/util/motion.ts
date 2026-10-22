const query = typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)") : undefined;

export function prefersReducedMotion(): boolean {
  return query?.matches ?? false;
}

/** Animation duration, or 0 when the user has asked the OS for less motion. */
export function motion(ms: number): number {
  return prefersReducedMotion() ? 0 : ms;
}
