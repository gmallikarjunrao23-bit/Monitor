import { NextRequest, NextResponse } from 'next/server';
import { addSecurityHeaders } from '@/lib/middleware/security';
import { logger } from '@/lib/middleware/logger';

export function middleware(request: NextRequest) {
  const start = Date.now();
  const { pathname, search } = request.nextUrl;

  logger.info('Incoming request', {
    method: request.method,
    endpoint: pathname,
  });

  const response = NextResponse.next();
  const duration = Date.now() - start;

  logger.info('Request completed', {
    method: request.method,
    endpoint: pathname,
    statusCode: response.status,
    duration,
  });

  return addSecurityHeaders(response);
}

export const config = {
  matcher: '/api/:path*',
};
