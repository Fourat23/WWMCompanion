import { createHash } from "crypto";

/**
 * Hash an IP address for vote deduplication.
 * We never store raw IPs — only a salted SHA-256 hash.
 */
export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT || "wwm-companion-default-salt";
  return createHash("sha256")
    .update(salt + ip)
    .digest("hex");
}
