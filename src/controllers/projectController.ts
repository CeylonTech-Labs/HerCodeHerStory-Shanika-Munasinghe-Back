import { z } from "zod";
import { prisma } from "../config/prisma";
import { AppError, asyncHandler } from "../middleware/errorMiddleware";
import { idParamSchema } from "../utils/controllerHelpers";
import { sendCreated, sendNoContent, sendSuccess } from "../utils/responseHandler";
import { slugify } from "../utils/slugify";

const projectSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  longDescription: z.string().optional().nullable(),
  techStack: z.string().optional().nullable(),
  githubUrl: z.string().optional().nullable(),
  liveUrl: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false)
});

const makeUniqueProjectSlug = async (titleOrSlug: string, excludeId?: number) => {
  const base = slugify(titleOrSlug) || "project";
  let candidate = base;
  let counter = 2;

  while (
    await prisma.project.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { NOT: { id: excludeId } } : {})
      }
    })
  ) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }

  return candidate;
};

export const getProjects = asyncHandler(async (_req, res) => {
  const projects = await prisma.project.findMany({
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }]
  });
  return sendSuccess(res, projects);
});

export const getProjectBySlug = asyncHandler(async (req, res) => {
  const { slug } = z.object({ slug: z.string().min(1) }).parse(req.params);
  const project = await prisma.project.findUnique({ where: { slug } });

  if (!project) {
    throw new AppError("Project not found.", 404);
  }

  return sendSuccess(res, project);
});

export const createProject = asyncHandler(async (req, res) => {
  const payload = projectSchema.parse(req.body);
  const project = await prisma.project.create({
    data: {
      ...payload,
      slug: await makeUniqueProjectSlug(payload.slug || payload.title)
    }
  });

  return sendCreated(res, project);
});

export const updateProject = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const payload = projectSchema.partial().parse(req.body);
  const project = await prisma.project.update({
    where: { id },
    data: {
      ...payload,
      slug: payload.slug || payload.title ? await makeUniqueProjectSlug(payload.slug || payload.title || "project", id) : undefined
    }
  });

  return sendSuccess(res, project, "Project updated successfully");
});

export const deleteProject = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  await prisma.project.delete({ where: { id } });
  return sendNoContent(res);
});
