import { z } from "zod";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../middleware/errorMiddleware";
import { idParamSchema, parseOptionalDate } from "../utils/controllerHelpers";
import { sendCreated, sendNoContent, sendSuccess } from "../utils/responseHandler";

const achievementSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  category: z.string().optional().nullable()
});

export const getAchievements = asyncHandler(async (_req, res) => {
  const achievements = await prisma.achievement.findMany({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }]
  });
  return sendSuccess(res, achievements);
});

export const createAchievement = asyncHandler(async (req, res) => {
  const payload = achievementSchema.parse(req.body);
  const achievement = await prisma.achievement.create({
    data: {
      ...payload,
      date: parseOptionalDate(payload.date)
    }
  });

  return sendCreated(res, achievement);
});

export const updateAchievement = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const payload = achievementSchema.partial().parse(req.body);
  const achievement = await prisma.achievement.update({
    where: { id },
    data: {
      ...payload,
      date: payload.date !== undefined ? parseOptionalDate(payload.date) : undefined
    }
  });

  return sendSuccess(res, achievement, "Achievement updated successfully");
});

export const deleteAchievement = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  await prisma.achievement.delete({ where: { id } });
  return sendNoContent(res);
});
