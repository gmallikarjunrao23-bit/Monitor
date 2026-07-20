import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { withErrorHandler, handleAsResponse, ApiError } from '@/lib/middleware/errorHandler';
import { withRateLimit } from '@/lib/middleware/rateLimit';
import { validateUserId } from '@/lib/middleware/security';
import { logger } from '@/lib/middleware/logger';
import { paginationSchema } from '@/lib/middleware/validation';

export async function GET(req: NextRequest) {
  const result = await withErrorHandler(async () => {
    const session = await auth();
    if (!session?.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const userId = (session.user as any).id;
    if (!validateUserId(userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const limitCheck = await withRateLimit(req, userId, 200);
    if (!limitCheck.allowed) {
      return limitCheck.response as any;
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '10');
    const status = searchParams.get('status');

    const parsed = paginationSchema.safeParse({ page, limit });
    if (!parsed.success) {
      throw new ApiError(400, 'Invalid pagination', {
        details: parsed.error.flatten(),
      });
    }

    const skip = (parsed.data.page - 1) * parsed.data.limit;

    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        where: {
          monitor: { userId },
          ...(status && { status: status as any }),
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parsed.data.limit,
        include: { monitor: { select: { name: true } } },
      }),
      prisma.incident.count({
        where: {
          monitor: { userId },
          ...(status && { status: status as any }),
        },
      }),
    ]);

    const activeCount = await prisma.incident.count({
      where: { monitor: { userId }, status: { not: 'RESOLVED' } },
    });
    const resolvedCount = total - activeCount;

    const resolvedWithDuration = incidents.filter((i) => i.durationSec != null);
    const avgResolutionMin =
      resolvedWithDuration.length > 0
        ? Math.round(
            resolvedWithDuration.reduce((sum, i) => sum + (i.durationSec ?? 0), 0) /
              resolvedWithDuration.length /
              60
          )
        : 0;

    logger.info('Incidents retrieved', {
      userId,
      count: incidents.length,
      page: parsed.data.page,
    });

    return {
      incidents: incidents.map((i) => ({
        id: i.id,
        monitorName: i.monitor.name,
        status: i.status,
        severity: i.severity,
        message: i.aiSummary ?? i.title,
        time: timeAgo(i.createdAt),
        startedAt: i.startedAt,
        resolvedAt: i.resolvedAt,
      })),
      pagination: {
        page: parsed.data.page,
        limit: parsed.data.limit,
        total,
        pages: Math.ceil(total / parsed.data.limit),
      },
      stats: {
        activeCount,
        resolvedCount,
        avgResolutionMin,
      },
    };
  });

  return handleAsResponse(result);
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
