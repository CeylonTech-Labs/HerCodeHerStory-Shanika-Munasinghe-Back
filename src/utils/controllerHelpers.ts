import { z } from "zod";

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const postIdParamSchema = z.object({
  postId: z.coerce.number().int().positive()
});

export const getPagination = (query: Record<string, unknown>) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const getPaginationMeta = (total: number, page: number, limit: number) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit)
});

export const parseOptionalDate = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const parseOptionalJsonArray = (value?: string | null) => {
  if (!value) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
};
