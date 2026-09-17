import { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";

export const config = {
  maxDuration: 10,
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.cookies?.admin_token;
  if (!token) return res.json({ isAdmin: false });
  if (!JWT_SECRET) return res.json({ isAdmin: false });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { isAdmin: boolean };
    return res.json({ isAdmin: Boolean(payload.isAdmin) });
  } catch {
    return res.json({ isAdmin: false });
  }
}
