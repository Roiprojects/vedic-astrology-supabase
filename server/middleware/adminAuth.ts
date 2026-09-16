import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getConfig } from "../lib/runtime-config";

export async function adminAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const JWT_SECRET = getConfig().JWT_SECRET;
  if (!JWT_SECRET) return res.status(503).json({ error: "Admin auth not configured" });
  const token = req.cookies?.admin_token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { isAdmin: boolean };
    if (!payload.isAdmin) return res.status(403).json({ error: "Forbidden" });
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
}
