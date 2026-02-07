import { randomBytes } from "crypto";

/**
 * Generate a secure random edit token for anonymous build ownership.
 * 32 bytes = 64 hex characters, cryptographically secure.
 */
export function generateEditToken(): string {
  return randomBytes(32).toString("hex");
}
