import { z } from "zod";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../middleware/errorMiddleware";
import { idParamSchema, parseOptionalDate } from "../utils/controllerHelpers";
import { sendCreated, sendNoContent, sendSuccess } from "../utils/responseHandler";

const timelineSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  eventDate: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  icon: z.string().optional().nullable()
});

export const getTimelineEvents = asyncHandler(async (_req, res) => {
  const events = await prisma.timelineEvent.findMany({
    orderBy: [{ eventDate: "desc" }, { createdAt: "desc" }]
  });
  return sendSuccess(res, events);
});

export const createTimelineEvent = asyncHandler(async (req, res) => {
  const payload = timelineSchema.parse(req.body);
  const event = await prisma.timelineEvent.create({
    data: {
      ...payload,
      eventDate: parseOptionalDate(payload.eventDate)
    }
  });

  return sendCreated(res, event);
});

export const updateTimelineEvent = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const payload = timelineSchema.partial().parse(req.body);
  const event = await prisma.timelineEvent.update({
    where: { id },
    data: {
      ...payload,
      eventDate: payload.eventDate !== undefined ? parseOptionalDate(payload.eventDate) : undefined
    }
  });

  return sendSuccess(res, event, "Timeline event updated successfully");
});

export const deleteTimelineEvent = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  await prisma.timelineEvent.delete({ where: { id } });
  return sendNoContent(res);
});
