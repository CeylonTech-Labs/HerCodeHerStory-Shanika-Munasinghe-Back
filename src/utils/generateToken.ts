import jwt from "jsonwebtoken";
import { env } from "../config/env";

type TokenPayload = {
  id: number;
  email: string;
  role: string;
};

export const generateToken = (payload: TokenPayload) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
};
