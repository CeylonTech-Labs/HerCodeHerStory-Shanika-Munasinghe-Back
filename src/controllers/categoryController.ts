import { z } from "zod";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../middleware/errorMiddleware";
import { idParamSchema } from "../utils/controllerHelpers";
import { sendCreated, sendNoContent, sendSuccess } from "../utils/responseHandler";
import { slugify } from "../utils/slugify";

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable()
});

export const getCategories = asyncHandler(async (_req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } }
  });

  return sendSuccess(res, categories);
});

export const createCategory = asyncHandler(async (req, res) => {
  const payload = categorySchema.parse(req.body);
  const category = await prisma.category.create({
    data: {
      ...payload,
      slug: payload.slug ? slugify(payload.slug) : slugify(payload.name)
    }
  });

  return sendCreated(res, category);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const payload = categorySchema.partial().parse(req.body);
  const category = await prisma.category.update({
    where: { id },
    data: {
      ...payload,
      slug: payload.slug ? slugify(payload.slug) : payload.name ? slugify(payload.name) : undefined
    }
  });

  return sendSuccess(res, category, "Category updated successfully");
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  await prisma.category.delete({ where: { id } });
  return sendNoContent(res);
});
