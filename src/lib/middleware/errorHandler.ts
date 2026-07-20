import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { logger } from './logger';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function withErrorHandler<T>(
  handler: () => Promise<T>
): Promise<{ data?: T; error?: any; statusCode: number }> {
  try {
    const data = await handler();
    return { data, statusCode: 200 };
  } catch (err: any) {
    logger.error('API Error', { error: err, context: err.context });

    if (err instanceof ApiError) {
      return {
        error: {
          message: err.message,
          code: err.name,
          ...(err.context && { context: err.context }),
        },
        statusCode: err.statusCode,
      };
    }

    if (err instanceof ZodError) {
      return {
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: err.flatten(),
        },
        statusCode: 400,
      };
    }

    if (err.code === 'P2002') {
      return {
        error: {
          message: 'Resource already exists',
          code: 'DUPLICATE_RESOURCE',
        },
        statusCode: 409,
      };
    }

    logger.error('Unhandled error', { error: err?.message || String(err) });
    return {
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      statusCode: 500,
    };
  }
}

export function handleAsResponse(
  result: { data?: any; error?: any; statusCode: number }
) {
  if (result.error) {
    return NextResponse.json(result.error, { status: result.statusCode });
  }
  return NextResponse.json(result.data, { status: result.statusCode });
}
