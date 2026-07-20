import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { withErrorHandler, handleAsResponse, ApiError } from '@/lib/middleware/errorHandler';
import { withRateLimit } from '@/lib/middleware/rateLimit';
import { validateUserId } from '@/lib/middleware/security';
import { logger } from '@/lib/middleware/logger';
import { monitorCreateSchema } from '@/lib/middleware/validation';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await withErrorHandler(async () => {
    const session = await auth();
    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const userId = (session.user as any).id;
    if (!validateUserId(userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const monitor = await prisma.monitor.findUnique({
      where: { id: params.id },
      include: {
        checks: { orderBy: { checkedAt: 'desc' }, take: 50 },
        sslInfo: true,
      },
    });

    if (!monitor) {
      throw new ApiError(404, 'Monitor not found');
    }

    if (monitor.userId !== userId) {
      throw new ApiError(403, 'You do not have access to this monitor');
    }

    logger.info('Monitor retrieved', { userId, monitorId: monitor.id });

    return {
      ...monitor,
      checks: monitor.checks.map((c) => ({
        id: c.id,
        success: c.success,
        statusCode: c.statusCode,
        responseTimeMs: c.responseTimeMs,
        errorMessage: c.errorMessage,
        checkedAt: c.checkedAt,
      })),
    };
  });

  return handleAsResponse(result);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await withErrorHandler(async () => {
    const session = await auth();
    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const userId = (session.user as any).id;
    if (!validateUserId(userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const limitCheck = await withRateLimit(req, userId, 50);
    if (!limitCheck.allowed) {
      return limitCheck.response as any;
    }

    const body = await req.json();
    const parsed = monitorCreateSchema.partial().safeParse(body);

    if (!parsed.success) {
      throw new ApiError(400, 'Invalid input', { details: parsed.error.flatten() });
    }

    const monitor = await prisma.monitor.findUnique({
      where: { id: params.id },
    });

    if (!monitor) {
      throw new ApiError(404, 'Monitor not found');
    }

    if (monitor.userId !== userId) {
      throw new ApiError(403, 'You do not have access to this monitor');
    }

    const updated = await prisma.monitor.update({
      where: { id: params.id },
      data: {
        name: parsed.data.name,
        target: parsed.data.target,
        type: parsed.data.type,
        checkIntervalSec: parsed.data.checkIntervalSec,
        timeoutSec: parsed.data.timeoutSec,
        retryCount: parsed.data.retryCount,
        retryDelaySec: parsed.data.retryDelaySec,
      },
    });

    logger.info('Monitor updated', { userId, monitorId: monitor.id });

    return { success: true, monitor: updated };
  });

  return handleAsResponse(result);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await withErrorHandler(async () => {
    const session = await auth();
    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const userId = (session.user as any).id;
    if (!validateUserId(userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const limitCheck = await withRateLimit(req, userId, 50);
    if (!limitCheck.allowed) {
      return limitCheck.response as any;
    }

    const monitor = await prisma.monitor.findUnique({
      where: { id: params.id },
    });

    if (!monitor) {
      throw new ApiError(404, 'Monitor not found');
    }

    if (monitor.userId !== userId) {
      throw new ApiError(403, 'You do not have access to this monitor');
    }

    await prisma.monitor.delete({
      where: { id: params.id },
    });

    logger.info('Monitor deleted', { userId, monitorId: monitor.id });

    return { success: true, message: 'Monitor deleted successfully' };
  });

  return handleAsResponse(result);
}
