import { z } from "zod";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../middleware/errorMiddleware";
import { sendSuccess } from "../utils/responseHandler";

const profileSchema = z.object({
  fullName: z.string().min(1),
  title: z.string().optional().nullable(),
  shortBio: z.string().optional().nullable(),
  longBio: z.string().optional().nullable(),
  profileImage: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  githubUrl: z.string().optional().nullable(),
  linkedinUrl: z.string().optional().nullable(),
  facebookUrl: z.string().optional().nullable(),
  instagramUrl: z.string().optional().nullable(),
  portfolioTitle: z.string().optional().nullable()
});

export const getProfile = asyncHandler(async (_req, res) => {
  const profile = await prisma.profile.findFirst({
    orderBy: { id: "asc" }
  });

  return sendSuccess(res, profile);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const payload = profileSchema.parse(req.body);
  const profile = await prisma.profile.upsert({
    where: { id: 1 },
    update: payload,
    create: {
      id: 1,
      ...payload
    }
  });

  return sendSuccess(res, profile, "Profile updated successfully");
});
