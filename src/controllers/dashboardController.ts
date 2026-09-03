import { prisma } from "../config/prisma";
import { asyncHandler } from "../middleware/errorMiddleware";
import { sendSuccess } from "../utils/responseHandler";

export const getDashboardStats = asyncHandler(async (_req, res) => {
  const [
    users,
    posts,
    publishedPosts,
    draftPosts,
    comments,
    pendingComments,
    reactions,
    projects,
    certificates,
    achievements,
    timelineEvents,
    media,
    contactMessages,
    newContactMessages
  ] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.post.count({ where: { status: "DRAFT" } }),
    prisma.comment.count(),
    prisma.comment.count({ where: { status: "PENDING" } }),
    prisma.reaction.count(),
    prisma.project.count(),
    prisma.certificate.count(),
    prisma.achievement.count(),
    prisma.timelineEvent.count(),
    prisma.media.count(),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { status: "NEW" } })
  ]);

  return sendSuccess(res, {
    users,
    posts,
    publishedPosts,
    draftPosts,
    comments,
    pendingComments,
    reactions,
    projects,
    certificates,
    achievements,
    timelineEvents,
    media,
    contactMessages,
    newContactMessages
  });
});
