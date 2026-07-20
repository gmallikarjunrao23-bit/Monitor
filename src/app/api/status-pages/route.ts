import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { withErrorHandler, handleAsResponse, ApiError } from '@/lib/middleware/errorHandler';
import { withRateLimit } from '@/lib/middleware/rateLimit';
import { validateUserId } from '@/lib/middleware/security';
import { logger } from '@/lib/middleware/logger';
import { statusPageSchema } from '@/lib/middleware/validation';

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

    const pages = await prisma.statusPage.findMany({
      where: { userId },
      select: {
        id: true,
        slug: true,
        customDomain: true,
        title: true,
        isPublic: true,
        createdAt: true,
      },
    });

    logger.info('Status pages retrieved', { userId });

    return { pages };
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
    const parsed = statusPageSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(400, 'Invalid input', {
        details: parsed.error.flatten(),
      });
    }

    const existing = await prisma.statusPage.findUnique({
      where: { slug: parsed.data.slug },
    });

    if (existing) {
      throw new ApiError(409, 'Status page slug already exists');
    }

    const page = await prisma.statusPage.create({
      data: {
        userId,
        slug: parsed.data.slug,
        title: parsed.data.title,
        description: parsed.data.description,
        theme: parsed.data.theme ?? 'dark',
        monitorIds: parsed.data.monitorIds ?? [],
        isPublic: parsed.data.isPublic ?? true,
      },
    });

    logger.info('Status page created', { userId, slug: page.slug });

    return { success: true, page };
  });

  return handleAsResponse(result);
}
