import { ContactStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../middleware/errorMiddleware";
import { getPagination, getPaginationMeta, idParamSchema } from "../utils/controllerHelpers";
import { sendCreated, sendNoContent, sendSuccess } from "../utils/responseHandler";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().optional().nullable(),
  message: z.string().min(1)
});

const statusSchema = z.object({
  status: z.nativeEnum(ContactStatus)
});

export const createContactMessage = asyncHandler(async (req, res) => {
  const payload = contactSchema.parse(req.body);
  const message = await prisma.contactMessage.create({ data: payload });
  return sendCreated(res, message, "Message sent successfully");
});

export const getContactMessages = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const status = z.nativeEnum(ContactStatus).optional().parse(req.query.status);
  const where = status ? { status } : {};

  const [messages, total] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }
    }),
    prisma.contactMessage.count({ where })
  ]);

  return sendSuccess(res, {
    messages,
    meta: getPaginationMeta(total, page, limit)
  });
});

export const updateContactMessageStatus = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const { status } = statusSchema.parse(req.body);
  const message = await prisma.contactMessage.update({
    where: { id },
    data: { status }
  });

  return sendSuccess(res, message, "Contact message status updated successfully");
});

export const deleteContactMessage = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  await prisma.contactMessage.delete({ where: { id } });
  return sendNoContent(res);
});
