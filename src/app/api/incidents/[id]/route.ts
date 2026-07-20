import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { withErrorHandler, handleAsResponse, ApiError } from '@/lib/middleware/errorHandler';
import { withRateLimit } from '@/lib/middleware/rateLimit';
import { validateUserId } from '@/lib/middleware/security';
import { logger } from '@/lib/middleware/logger';
import { incidentUpdateSchema } from '@/lib/middleware/validation';

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

    const limitCheck = await withRateLimit(req, userId, 200);
    if (!limitCheck.allowed) {
      return limitCheck.response as any;
    }

    const incident = await prisma.incident.findUnique({
      where: { id: params.id },
      include: {
        monitor: { select: { id: true, name: true, userId: true } },
        updates: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!incident) {
      throw new ApiError(404, 'Incident not found');
    }

    if (incident.monitor.userId !== userId) {
      throw new ApiError(403, 'You do not have access to this incident');
    }

    logger.info('Incident retrieved', { userId, incidentId: incident.id });

    return {
      id: incident.id,
      monitorId: incident.monitor.id,
      monitorName: incident.monitor.name,
      title: incident.title,
      status: incident.status,
      severity: incident.severity,
      startedAt: incident.startedAt,
      resolvedAt: incident.resolvedAt,
      durationSec: incident.durationSec,
      aiSummary: incident.aiSummary,
      aiRootCause: incident.aiRootCause,
      aiRecommendation: incident.aiRecommendation,
      aiImpactEstimate: incident.aiImpactEstimate,
      aiExecutiveReport: incident.aiExecutiveReport,
      updates: incident.updates.map((u) => ({
        id: u.id,
        message: u.message,
        createdAt: u.createdAt,
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

    const limitCheck = await withRateLimit(req, userId, 100);
    if (!limitCheck.allowed) {
      return limitCheck.response as any;
    }

    const body = await req.json();
    const parsed = incidentUpdateSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(400, 'Invalid input', { details: parsed.error.flatten() });
    }

    const incident = await prisma.incident.findUnique({
      where: { id: params.id },
      include: { monitor: { select: { userId: true } } },
    });

    if (!incident) {
      throw new ApiError(404, 'Incident not found');
    }

    if (incident.monitor.userId !== userId) {
      throw new ApiError(403, 'You do not have access to this incident');
    }

    const updated = await prisma.incident.update({
      where: { id: params.id },
      data: {
        status: parsed.data.status,
        severity: parsed.data.severity,
      },
    });

    if (parsed.data.message) {
      await prisma.incidentUpdate.create({
        data: {
          incidentId: params.id,
          message: parsed.data.message,
        },
      });
    }

    logger.info('Incident updated', { userId, incidentId: incident.id });

    return { success: true, incident: updated };
  });

  return handleAsResponse(result);
}
