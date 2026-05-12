import { Response } from "express";

export const sendSuccess = <T>(res: Response, data: T, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const sendCreated = <T>(res: Response, data: T, message = "Created successfully") => {
  return sendSuccess(res, data, message, 201);
};

export const sendNoContent = (res: Response) => {
  return res.status(204).send();
};
