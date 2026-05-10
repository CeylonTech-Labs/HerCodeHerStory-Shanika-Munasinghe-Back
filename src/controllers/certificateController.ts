import { z } from "zod";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../middleware/errorMiddleware";
import { idParamSchema, parseOptionalDate } from "../utils/controllerHelpers";
import { sendCreated, sendNoContent, sendSuccess } from "../utils/responseHandler";

const certificateSchema = z.object({
  title: z.string().min(1),
  issuer: z.string().min(1),
  issuedDate: z.string().optional().nullable(),
  credentialUrl: z.string().optional().nullable(),
  certificateImage: z.string().optional().nullable(),
  description: z.string().optional().nullable()
});

export const getCertificates = asyncHandler(async (_req, res) => {
  const certificates = await prisma.certificate.findMany({
    orderBy: [{ issuedDate: "desc" }, { createdAt: "desc" }]
  });
  return sendSuccess(res, certificates);
});

export const createCertificate = asyncHandler(async (req, res) => {
  const payload = certificateSchema.parse(req.body);
  const certificate = await prisma.certificate.create({
    data: {
      ...payload,
      issuedDate: parseOptionalDate(payload.issuedDate)
    }
  });

  return sendCreated(res, certificate);
});

export const updateCertificate = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const payload = certificateSchema.partial().parse(req.body);
  const certificate = await prisma.certificate.update({
    where: { id },
    data: {
      ...payload,
      issuedDate: payload.issuedDate !== undefined ? parseOptionalDate(payload.issuedDate) : undefined
    }
  });

  return sendSuccess(res, certificate, "Certificate updated successfully");
});

export const deleteCertificate = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  await prisma.certificate.delete({ where: { id } });
  return sendNoContent(res);
});
