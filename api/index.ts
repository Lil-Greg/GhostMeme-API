import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { apiKeyAuth } from "./middleware/apiKeyAuth";
import rateLimit from "express-rate-limit";
import { getByMemeIds } from "./endpoints/meme-endpoints/getByMemeIds";
import { memesGetEndpoint } from "./endpoints/meme-endpoints/getMemes";
import { memesPostEndpoint } from "./endpoints/meme-endpoints/postMeme";
import { supabase } from "./supabase-init";

export const app = express();
export const baseUrl = "/api";

const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;

app.use(express.json());
app.use(
  cors({
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// Limiting the rate for each ip
app.use(
  rateLimit({
    windowMs: 1000, // Time to remember request, so requests will be in memory for 1 seconds
    limit: 10,
    handler: (req, res, next, options) => {
      // Setting timeouts
      supabase
        .from("Memes")
        .select()
        .abortSignal(AbortSignal.timeout(1000 * 30));

      supabase
        .from("Users")
        .select()
        .abortSignal(AbortSignal.timeout(1000 * 30));

      res
        .status(options.statusCode)
        .send("Too many Requests! Try again after 30 seconds!! 🤓");
      return AbortSignal.timeout(1000 * 30);
    },
  })
);
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
  next();
});

app.use(apiKeyAuth);

app.use(memesGetEndpoint);

app.use(memesPostEndpoint);

/**
 * 8/24/2025 01:16
 * May have to use regex to include the optional parameters of the endpoints
 *
 */

app.get("/", (res: Response) => {
  res.json({ message: "Welcome to the Express + TypeScript Server!" });
});

// Start the Express server
app.listen(port, () => {
  console.log(`The server is running at http://localhost:${port}`);
});

export default app;
