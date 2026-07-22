/**
 * Database-Backed Rate Limiter (Serverless Safe)
 * 
 * Uses PostgreSQL `RateLimits` table instead of in-memory Map.
 * Works correctly on Vercel, AWS Lambda, and any serverless platform
 * because state is persisted in the database, not process memory.
 * 
 * Config: 5 attempts per IP in 5 minutes.
 * After limit exceeded: 15 minute cooldown before allowing more attempts.
 * Stale entries auto-cleaned during each check.
 */

import { Op } from 'sequelize';
import db from './db';

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 5 * 60 * 1000;      // 5 minutes
const COOLDOWN_MS = 15 * 60 * 1000;   // 15 minutes

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
  remainingAttempts?: number;
}

/**
 * Check if a request from the given IP is allowed.
 * Call this at the START of your route handler.
 * 
 * @param ip - Client IP address
 * @returns RateLimitResult with allowed status and metadata
 */
export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const now = new Date();

  // Clean up old entries (stale entries older than window + cooldown)
  // Fire-and-forget, don't block the request
  db.RateLimit.destroy({
    where: {
      updatedAt: {
        [Op.lt]: new Date(now.getTime() - WINDOW_MS - COOLDOWN_MS)
      },
      blockedUntil: {
        [Op.or]: [
          { [Op.eq]: null },
          { [Op.lt]: now }
        ]
      }
    }
  }).catch(() => {}); // Silently ignore cleanup errors

  let entry = await db.RateLimit.findOne({ where: { key: ip } });

  if (!entry) {
    // First request from this IP — create entry
    await db.RateLimit.create({
      key: ip,
      attempts: 1,
      windowStart: now,
      blockedUntil: null
    });
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 };
  }

  const e = entry as any;

  // Check if IP is in cooldown
  if (e.blockedUntil && new Date(e.blockedUntil) > now) {
    const retryAfterSeconds = Math.ceil(
      (new Date(e.blockedUntil).getTime() - now.getTime()) / 1000
    );
    return { allowed: false, retryAfterSeconds };
  }

  // Check if the sliding window has expired — reset counter
  if (now.getTime() - new Date(e.windowStart).getTime() > WINDOW_MS) {
    await entry.update({ attempts: 1, windowStart: now, blockedUntil: null });
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 };
  }

  // Within window — check if attempts exceeded
  if (e.attempts >= MAX_ATTEMPTS) {
    // Activate cooldown
    const blockedUntil = new Date(now.getTime() + COOLDOWN_MS);
    await entry.update({ attempts: 0, windowStart: now, blockedUntil });
    const retryAfterSeconds = Math.ceil(COOLDOWN_MS / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  // Record this attempt
  await entry.update({ attempts: e.attempts + 1 });
  const remainingAttempts = MAX_ATTEMPTS - e.attempts - 1;

  return { allowed: true, remainingAttempts };
}
