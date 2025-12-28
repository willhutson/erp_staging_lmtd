/**
 * GET /api/v1/time/timer/current - Get current running timer
 * POST /api/v1/time/timer/start - Start a timer
 * POST /api/v1/time/timer/stop - Stop the running timer
 */

import { z } from "zod";
import prisma from "@/lib/prisma";
import {
  getAuthContext,
  success,
  created,
  handleRoute,
  validateBody,
  ApiError,
} from "@/lib/api";

const StartTimerSchema = z.object({
  briefId: z.string().cuid().optional().nullable(),
  projectId: z.string().cuid().optional().nullable(),
  description: z.string().max(500).optional().nullable(),
});

export async function GET() {
  return handleRoute(async () => {
    const context = await getAuthContext();

    const runningTimer = await prisma.timeEntry.findFirst({
      where: {
        userId: context.user.id,
        isRunning: true,
      },
      select: {
        id: true,
        description: true,
        startTime: true,
        isRunning: true,
        brief: {
          select: { id: true, briefNumber: true, title: true },
        },
        project: {
          select: { id: true, name: true },
        },
      },
    });

    return success(runningTimer);
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const context = await getAuthContext();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "start") {
      return startTimer(request, context);
    } else if (action === "stop") {
      return stopTimer(context);
    } else {
      throw ApiError.badRequest("Invalid action. Use ?action=start or ?action=stop");
    }
  });
}

async function startTimer(request: Request, context: { user: { id: string }; organizationId: string }) {
  const data = await validateBody(request, StartTimerSchema);

  // Check for existing running timer
  const existingTimer = await prisma.timeEntry.findFirst({
    where: {
      userId: context.user.id,
      isRunning: true,
    },
  });

  if (existingTimer) {
    throw ApiError.conflict("A timer is already running. Stop it first.");
  }

  // Validate brief if provided
  if (data.briefId) {
    const brief = await prisma.brief.findFirst({
      where: {
        id: data.briefId,
        organizationId: context.organizationId,
      },
    });

    if (!brief) {
      throw ApiError.notFound("Brief");
    }

    if (!data.projectId && brief.projectId) {
      data.projectId = brief.projectId;
    }
  }

  const now = new Date();

  const timer = await prisma.timeEntry.create({
    data: {
      ...data,
      organizationId: context.organizationId,
      userId: context.user.id,
      date: now,
      hours: 0,
      startTime: now,
      isRunning: true,
      isBillable: true,
    },
    select: {
      id: true,
      description: true,
      startTime: true,
      isRunning: true,
      brief: {
        select: { id: true, briefNumber: true, title: true },
      },
      project: {
        select: { id: true, name: true },
      },
    },
  });

  return created(timer);
}

async function stopTimer(context: { user: { id: string } }) {
  const runningTimer = await prisma.timeEntry.findFirst({
    where: {
      userId: context.user.id,
      isRunning: true,
    },
  });

  if (!runningTimer) {
    throw ApiError.notFound("No running timer found");
  }

  const now = new Date();
  const startTime = runningTimer.startTime || now;
  const durationMs = now.getTime() - startTime.getTime();
  const hours = Math.round((durationMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimals

  const stopped = await prisma.timeEntry.update({
    where: { id: runningTimer.id },
    data: {
      endTime: now,
      hours: Math.max(0.25, hours), // Minimum 15 minutes
      isRunning: false,
    },
    select: {
      id: true,
      description: true,
      date: true,
      hours: true,
      startTime: true,
      endTime: true,
      isRunning: true,
      brief: {
        select: { id: true, briefNumber: true, title: true },
      },
      project: {
        select: { id: true, name: true },
      },
    },
  });

  // Update brief actual hours if linked
  if (stopped.brief) {
    const totalHours = await prisma.timeEntry.aggregate({
      where: { briefId: stopped.brief.id },
      _sum: { hours: true },
    });

    await prisma.brief.update({
      where: { id: stopped.brief.id },
      data: { actualHours: totalHours._sum.hours },
    });
  }

  return success(stopped);
}
