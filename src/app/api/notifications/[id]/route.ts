import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { withErrorHandler, handleAsResponse, ApiError } from '@/lib/middleware/errorHandler';
import { withRateLimit } from '@/lib/middleware/rateLimit';
import { validateUserId } from '@/lib/middleware/security';
import { logger } from '@/lib/middleware/logger';

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

    const channel = await prisma.notificationChannel.findUnique({
      where: { id: params.id },
    });

    if (!channel) {
      throw new ApiError(404, 'Channel not found');
    }

    if (channel.userId !== userId) {
      throw new ApiError(403, 'You do not have access to this channel');
    }

    await prisma.notificationChannel.delete({
      where: { id: params.id },
    });

    logger.info('Notification channel deleted', {
      userId,
      channelId: channel.id,
    });

    return { success: true };
  });

  return handleAsResponse(result);
}
