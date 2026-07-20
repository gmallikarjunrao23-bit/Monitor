import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { withErrorHandler, handleAsResponse, ApiError } from '@/lib/middleware/errorHandler';
import { withRateLimit } from '@/lib/middleware/rateLimit';
import { validateUserId } from '@/lib/middleware/security';
import { logger } from '@/lib/middleware/logger';
import { notificationChannelSchema } from '@/lib/middleware/validation';

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

    const channels = await prisma.notificationChannel.findMany({
      where: { userId },
      select: {
        id: true,
        type: true,
        target: true,
        isActive: true,
      },
    });

    logger.info('Notification channels retrieved', { userId });

    return { channels };
  });

  return handleAsResponse(result);
}

export async function POST(req: NextRequest) {
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
    const parsed = notificationChannelSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(400, 'Invalid input', {
        details: parsed.error.flatten(),
      });
    }

    const channel = await prisma.notificationChannel.create({
      data: {
        userId,
        type: parsed.data.type,
        target: parsed.data.target,
        isActive: parsed.data.isActive ?? true,
      },
    });

    logger.info('Notification channel created', {
      userId,
      channelType: channel.type,
    });

    return { success: true, channel };
  });

  return handleAsResponse(result);
}
