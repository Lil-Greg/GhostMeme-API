import { NextFunction, Request, Response } from "express";

export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const apiKeys = [
    process.env.LANDING_KEY,
    process.env.FRANCES_KEY,
    process.env.CHLOE_KEY,
    process.env.GREG_KEY,
  ];
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res
      .status(401)
      .json({ success: false, error: "Missing Authorization header" });
  }

  // Expect header in format: Authorization: Bearer <API_KEY>
  const [scheme, key] = authHeader.split(" ");

  if (scheme.toLowerCase() !== "bearer" || !apiKeys.includes(key)) {
    return res
      .status(401)
      .json({ success: false, error: "Unauthorized: Invalid API key" });
  }

  // Check the amount of requests for this api key.

  next();
}
