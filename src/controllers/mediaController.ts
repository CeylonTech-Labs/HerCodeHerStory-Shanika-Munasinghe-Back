import { FileType } from "@prisma/client";
import { UploadApiResponse } from "cloudinary";
import { z } from "zod";
import { cloudinary, ensureCloudinaryConfigured } from "../config/cloudinary";
import { prisma } from "../config/prisma";
import { AppError, asyncHandler } from "../middleware/errorMiddleware";
import { getPagination, getPaginationMeta, idParamSchema } from "../utils/controllerHelpers";
import { sendCreated, sendNoContent, sendSuccess } from "../utils/responseHandler";

const mediaSchema = z.object({
  postId: z.coerce.number().int().positive().optional(),
  caption: z.string().optional(),
  altText: z.string().optional(),
  cropShape: z.string().optional()
});

const getFileType = (mimeType: string): FileType => {
  if (mimeType.startsWith("image/")) {
    return FileType.IMAGE;
  }

  if (mimeType.startsWith("video/")) {
    return FileType.VIDEO;
  }

  return FileType.DOCUMENT;
};

const uploadBufferToCloudinary = (file: Express.Multer.File) => {
  ensureCloudinaryConfigured();

  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "hercodeherstory",
        resource_type: "auto"
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary upload failed."));
          return;
        }

        resolve(result);
      }
    );

    stream.end(file.buffer);
  });
};

export const uploadMedia = asyncHandler(async (req, res) => {
  const files = Array.isArray(req.files) ? req.files : [];

  if (!files.length) {
    throw new AppError("At least one file is required.", 400);
  }

  const payload = mediaSchema.parse(req.body);
  const uploadedMedia = await Promise.all(
    files.map(async (file) => {
      const uploaded = await uploadBufferToCloudinary(file);

      return prisma.media.create({
        data: {
          postId: payload.postId,
          fileUrl: uploaded.secure_url,
          fileType: getFileType(file.mimetype),
          publicId: uploaded.public_id,
          caption: payload.caption,
          altText: payload.altText,
          cropShape: payload.cropShape
        }
      });
    })
  );

  return sendCreated(res, uploadedMedia, "Media uploaded successfully");
});

export const getMedia = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const [media, total] = await Promise.all([
    prisma.media.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { post: { select: { id: true, title: true, slug: true } } }
    }),
    prisma.media.count()
  ]);

  return sendSuccess(res, {
    media,
    meta: getPaginationMeta(total, page, limit)
  });
});

export const deleteMedia = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const media = await prisma.media.findUnique({ where: { id } });

  if (!media) {
    throw new AppError("Media not found.", 404);
  }

  if (media.publicId) {
    ensureCloudinaryConfigured();
    await cloudinary.uploader.destroy(media.publicId, {
      resource_type: media.fileType === FileType.VIDEO ? "video" : "image"
    });
  }

  await prisma.media.delete({ where: { id } });
  return sendNoContent(res);
});
