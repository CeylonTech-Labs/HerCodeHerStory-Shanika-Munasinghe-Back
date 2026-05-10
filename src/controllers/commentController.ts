import { CommentStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { AppError, asyncHandler } from "../middleware/errorMiddleware";
import { getPagination, getPaginationMeta, idParamSchema, postIdParamSchema } from "../utils/controllerHelpers";
import { sendCreated, sendNoContent, sendSuccess } from "../utils/responseHandler";

const createCommentSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  comment: z.string().min(1)
});

const statusSchema = z.object({
  status: z.nativeEnum(CommentStatus)
});

export const getComments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const status = z.nativeEnum(CommentStatus).optional().parse(req.query.status);
  const where = status ? { status } : {};

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { post: { select: { id: true, title: true, slug: true } } }
    }),
    prisma.comment.count({ where })
  ]);

  return sendSuccess(res, {
    comments,
    meta: getPaginationMeta(total, page, limit)
  });
});

export const createComment = asyncHandler(async (req, res) => {
  const { postId } = postIdParamSchema.parse(req.params);
  const payload = createCommentSchema.parse(req.body);
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { allowComments: true, status: true }
  });

  if (!post || post.status !== "PUBLISHED") {
    throw new AppError("Post not found.", 404);
  }

  if (!post.allowComments) {
    throw new AppError("Comments are disabled for this post.", 403);
  }

  const comment = await prisma.comment.create({
    data: {
      postId,
      name: payload.name,
      email: payload.email,
      comment: payload.comment
    }
  });

  return sendCreated(res, comment, "Comment submitted for review");
});

export const updateCommentStatus = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const { status } = statusSchema.parse(req.body);
  const comment = await prisma.comment.update({
    where: { id },
    data: { status }
  });

  return sendSuccess(res, comment, "Comment status updated successfully");
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  await prisma.comment.delete({ where: { id } });
  return sendNoContent(res);
});
