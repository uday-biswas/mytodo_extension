import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

export const isAuth: RequestHandler<{}, any, any, {}> = (req: any, _, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new Error("not authenticated");
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new Error("not authenticated");
  }

  const secret = process.env.ACCESS_TOKEN_SECRET; // Add this line

if (!secret) {
    throw new Error("Access token secret is not defined"); // Add this line
}

  try {
    const payload: any = jwt.verify(token, secret);
    console.log("payload: ", payload);
    req.userId = payload.userId;
    next();
    return;
  } catch {}

  throw new Error("not authenticated");
};
