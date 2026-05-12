import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { asyncHandler, AppError } from "../middleware/errorMiddleware";
import { generateToken } from "../utils/generateToken";
import { sendSuccess } from "../utils/responseHandler";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const login = asyncHandler(async (req, res) => {
  const payload = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email: payload.email }
  });

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  const passwordMatches = await bcrypt.compare(payload.password, user.password);

  if (!passwordMatches) {
    throw new AppError("Invalid email or password.", 401);
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  return sendSuccess(res, {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      bio: user.bio
    }
  });
});

export const me = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError("Authentication is required.", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return sendSuccess(res, user);
});
