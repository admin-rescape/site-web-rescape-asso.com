/**
 * Next.js middleware entry-point.
 * Re-exports the auth-wrapped middleware and route matcher from proxy.ts
 * so that Next.js picks it up correctly (the file must be named middleware.ts).
 */
export { default, config } from "./proxy";
