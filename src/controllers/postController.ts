import { PostStatus, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { AppError, asyncHandler } from "../middleware/errorMiddleware";
import {
  getPagination,
  getPaginationMeta,
  idParamSchema,
  parseOptionalDate
} from "../utils/controllerHelpers";
import { sendCreated, sendNoContent, sendSuccess } from "../utils/responseHandler";
import { slugify } from "../utils/slugify";

const postInclude = {
  category: true,
  tags: { include: { tag: true } },
  media: true,
  _count: { select: { comments: true, reactions: true } }
};

const postSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  excerpt: z.string().optional().nullable(),
  content: z.string().min(1),
  coverImage: z.string().optional().nullable(),
  videoUrl: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  mood: z.string().optional().nullable(),
  status: z.nativeEnum(PostStatus).default(PostStatus.DRAFT),
  isFeatured: z.boolean().default(false),
  allowComments: z.boolean().default(true),
  allowReactions: z.boolean().default(true),
  categoryId: z.number().int().positive().optional().nullable(),
  publishedAt: z.string().optional().nullable(),
  tagIds: z.array(z.number().int().positive()).optional(),
  tagNames: z.array(z.string().min(1)).optional()
});

const postQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  status: z.nativeEnum(PostStatus).optional(),
  featured: z.string().optional()
});

const makeUniquePostSlug = async (titleOrSlug: string, excludeId?: number) => {
  const base = slugify(titleOrSlug) || "post";
  let candidate = base;
  let counter = 2;

  while (
    await prisma.post.findFirst({
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

const resolveTagCreates = async (tagIds?: number[], tagNames?: string[]) => {
  const ids = new Set(tagIds ?? []);

  for (const tagName of tagNames ?? []) {
    const slug = slugify(tagName);
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: { name: tagName },
      create: { name: tagName, slug }
    });
    ids.add(tag.id);
  }

  return Array.from(ids).map((tagId) => ({
    tag: { connect: { id: tagId } }
  }));
};

export const getPosts = asyncHandler(async (req, res) => {
  const query = postQuerySchema.parse(req.query);
  const { page, limit, skip } = getPagination(req.query);
  const where: Prisma.PostWhereInput = {};

  if (req.user && query.status) {
    where.status = query.status;
  } else if (!req.user) {
    where.status = PostStatus.PUBLISHED;
  }

  if (query.featured === "true") {
    where.isFeatured = true;
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search } },
      { excerpt: { contains: query.search } },
      { content: { contains: query.search } },
      { location: { contains: query.search } },
      { mood: { contains: query.search } }
    ];
  }

  if (query.category) {
    const categoryId = Number(query.category);
    where.category = Number.isNaN(categoryId)
      ? { slug: query.category }
      : { id: categoryId };
  }

  if (query.tag) {
    const tagId = Number(query.tag);
    where.tags = {
      some: {
        tag: Number.isNaN(tagId) ? { slug: query.tag } : { id: tagId }
      }
    };
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      include: postInclude
    }),
    prisma.post.count({ where })
  ]);

  return sendSuccess(res, {
    posts,
    meta: getPaginationMeta(total, page, limit)
  });
});

export const getFeaturedPosts = asyncHandler(async (_req, res) => {
  const posts = await prisma.post.findMany({
    where: {
      status: PostStatus.PUBLISHED,
      isFeatured: true
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    include: postInclude
  });

  return sendSuccess(res, posts);
});

export const getPostBySlug = asyncHandler(async (req, res) => {
  const { slug } = z.object({ slug: z.string().min(1) }).parse(req.params);
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      ...postInclude,
      comments: {
        where: req.user ? undefined : { status: "APPROVED" },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!post || (!req.user && post.status !== PostStatus.PUBLISHED)) {
    throw new AppError("Post not found.", 404);
  }

  return sendSuccess(res, post);
});

export const createPost = asyncHandler(async (req, res) => {
  const payload = postSchema.parse(req.body);
  const slug = await makeUniquePostSlug(payload.slug || payload.title);
  const tagCreates = await resolveTagCreates(payload.tagIds, payload.tagNames);
  const publishedAt =
    payload.status === PostStatus.PUBLISHED ? parseOptionalDate(payload.publishedAt) ?? new Date() : null;

  const post = await prisma.post.create({
    data: {
      title: payload.title,
      slug,
      excerpt: payload.excerpt,
      content: payload.content,
      coverImage: payload.coverImage,
      videoUrl: payload.videoUrl,
      location: payload.location,
      mood: payload.mood,
      status: payload.status,
      isFeatured: payload.isFeatured,
      allowComments: payload.allowComments,
      allowReactions: payload.allowReactions,
      categoryId: payload.categoryId ?? null,
      publishedAt,
      tags: tagCreates.length ? { create: tagCreates } : undefined
    },
    include: postInclude
  });

  return sendCreated(res, post);
});

export const updatePost = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const payload = postSchema.partial().parse(req.body);
  const tagCreates =
    payload.tagIds || payload.tagNames ? await resolveTagCreates(payload.tagIds, payload.tagNames) : undefined;

  const post = await prisma.post.update({
    where: { id },
    data: {
      title: payload.title,
      slug: payload.slug || payload.title ? await makeUniquePostSlug(payload.slug || payload.title || "post", id) : undefined,
      excerpt: payload.excerpt,
      content: payload.content,
      coverImage: payload.coverImage,
      videoUrl: payload.videoUrl,
      location: payload.location,
      mood: payload.mood,
      status: payload.status,
      isFeatured: payload.isFeatured,
      allowComments: payload.allowComments,
      allowReactions: payload.allowReactions,
      categoryId: payload.categoryId,
      publishedAt:
        payload.publishedAt !== undefined
          ? parseOptionalDate(payload.publishedAt)
          : payload.status === PostStatus.PUBLISHED
            ? new Date()
            : undefined,
      tags: tagCreates
        ? {
            deleteMany: {},
            create: tagCreates
          }
        : undefined
    },
    include: postInclude
  });

  return sendSuccess(res, post, "Post updated successfully");
});

export const deletePost = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  await prisma.post.delete({ where: { id } });
  return sendNoContent(res);
});
