import { z } from "zod";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../middleware/errorMiddleware";
import { idParamSchema } from "../utils/controllerHelpers";
import { sendCreated, sendNoContent, sendSuccess } from "../utils/responseHandler";
import { slugify } from "../utils/slugify";

const tagSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional()
});

export const getTags = asyncHandler(async (_req, res) => {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } }
  });

  return sendSuccess(res, tags);
});

export const createTag = asyncHandler(async (req, res) => {
  const payload = tagSchema.parse(req.body);
  const tag = await prisma.tag.create({
    data: {
      name: payload.name,
      slug: payload.slug ? slugify(payload.slug) : slugify(payload.name)
    }
  });

  return sendCreated(res, tag);
});

export const deleteTag = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  await prisma.tag.delete({ where: { id } });
  return sendNoContent(res);
});
