import { ReactionType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { AppError, asyncHandler } from "../middleware/errorMiddleware";
import { postIdParamSchema } from "../utils/controllerHelpers";
import { sendCreated, sendSuccess } from "../utils/responseHandler";

const reactionSchema = z.object({
  reactionType: z.nativeEnum(ReactionType),
  visitorId: z.string().min(1)
});

export const getPostReactions = asyncHandler(async (req, res) => {
  const { postId } = postIdParamSchema.parse(req.params);
  const grouped = await prisma.reaction.groupBy({
    by: ["reactionType"],
    where: { postId },
    _count: { reactionType: true }
  });

  return sendSuccess(
    res,
    grouped.map((reaction) => ({
      reactionType: reaction.reactionType,
      count: reaction._count.reactionType
    }))
  );
});

export const createReaction = asyncHandler(async (req, res) => {
  const { postId } = postIdParamSchema.parse(req.params);
  const payload = reactionSchema.parse(req.body);
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { allowReactions: true, status: true }
  });

  if (!post || post.status !== "PUBLISHED") {
    throw new AppError("Post not found.", 404);
  }

  if (!post.allowReactions) {
    throw new AppError("Reactions are disabled for this post.", 403);
  }

  const reaction = await prisma.reaction.upsert({
    where: {
      postId_visitorId_reactionType: {
        postId,
        visitorId: payload.visitorId,
        reactionType: payload.reactionType
      }
    },
    update: {
      ipAddress: req.ip
    },
    create: {
      postId,
      visitorId: payload.visitorId,
      reactionType: payload.reactionType,
      ipAddress: req.ip
    }
  });

  return sendCreated(res, reaction);
});
