import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  [key: string]: { count: number; resetAt: number };
}

const store: RateLimitStore = {};

function getKey(identifier: string, endpoint: string): string {
  return `${identifier}:${endpoint}`;
}

function cleanup() {
  const now = Date.now();
  for (const key in store) {
    if (store[key].resetAt < now) {
      delete store[key];
    }
  }
}

export function rateLimit(
  identifier: string,
  endpoint: string,
  maxRequests: number = 100,
  windowMs: number = 60 * 1000 // 1 minute
): { allowed: boolean; remaining: number; resetAt: number } {
  cleanup();

  const key = getKey(identifier, endpoint);
  const now = Date.now();

  if (!store[key]) {
    store[key] = { count: 1, resetAt: now + windowMs };
    return { allowed: true, remaining: maxRequests - 1, resetAt: store[key].resetAt };
  }

  const record = store[key];

  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + windowMs;
    return { allowed: true, remaining: maxRequests - 1, resetAt: record.resetAt };
  }

  record.count++;
  const allowed = record.count <= maxRequests;
  const remaining = Math.max(0, maxRequests - record.count);

  return { allowed, remaining, resetAt: record.resetAt };
}

export async function withRateLimit(
  req: NextRequest,
  userId: string,
  maxRequests: number = 100,
  windowMs: number = 60 * 1000
): Promise<{ allowed: boolean; response?: NextResponse }> {
  const endpoint = new URL(req.url).pathname;
  const limit = rateLimit(userId, endpoint, maxRequests, windowMs);

  if (!limit.allowed) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
          },
        }
      ),
    };
  }

  return { allowed: true };
}
