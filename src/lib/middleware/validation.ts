import { z } from 'zod';

export const monitorCreateSchema = z.object({
  name: z.string().min(1, 'Monitor name required').max(100),
  target: z.string().url('Invalid URL').max(500),
  type: z.enum(['HTTP', 'HTTPS', 'TCP', 'PING', 'DNS', 'SSL', 'KEYWORD', 'API', 'WEBSOCKET', 'HEARTBEAT']),
  description: z.string().max(500).optional(),
  checkIntervalSec: z.number().min(30).max(3600).optional(),
  timeoutSec: z.number().min(5).max(120).optional(),
  retryCount: z.number().min(0).max(5).optional(),
  retryDelaySec: z.number().min(5).max(300).optional(),
  requestHeaders: z.record(z.string()).optional(),
  requestBody: z.string().optional(),
  expectedStatusCodes: z.array(z.number()).optional(),
  expectedKeyword: z.string().optional(),
  unexpectedKeyword: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const incidentUpdateSchema = z.object({
  status: z.enum(['INVESTIGATING', 'IDENTIFIED', 'MONITORING', 'RESOLVED']).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  message: z.string().min(1).max(1000).optional(),
});

export const notificationChannelSchema = z.object({
  type: z.enum(['EMAIL', 'TELEGRAM', 'DISCORD', 'SLACK', 'WEBHOOK', 'TEAMS']),
  target: z.string().min(1).max(500),
  isActive: z.boolean().optional(),
});

export const statusPageSchema = z.object({
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  theme: z.enum(['dark', 'light']).optional(),
  monitorIds: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
});

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
