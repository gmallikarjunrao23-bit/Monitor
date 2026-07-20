import { NextResponse } from 'next/server';

export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  return response;
}

export function validateUserId(userId: any): boolean {
  return typeof userId === 'string' && userId.length > 0 && userId.length < 100;
}

export function sanitizeString(str: string, maxLength: number = 1000): string {
  return str.substring(0, maxLength).trim();
}
