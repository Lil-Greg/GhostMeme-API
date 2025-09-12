import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { apiKeyAuth } from "./middleware/apiKeyAuth";
import rateLimit from "express-rate-limit";
import { getByMemeIds } from "./endpoints/meme-endpoints/getByMemeIds";
import { memesGetEndpoint } from "./endpoints/meme-endpoints/getMemes";
import { memesPostEndpoint } from "./endpoints/meme-endpoints/postMeme";
import { supabase } from "./supabase-init";
import slowDown from "express-slow-down";
import {
  deleteByUserId,
  deleteFriend,
  deleteFriendRequest,
  getByUserId,
  getByUsername,
  getFriendByUserId,
  getFriendRequestType,
  getFriends,
  getLikedMemeByUserId,
  getLikedMemesByUserId,
  getRequestByTarget,
  getUsers,
  newFriend,
  newFriendRequest,
  postUsers,
  putByUserId,
} from "./endpoints/user-endpoints/userCalls";
import {
  memesIdLikesGetEndpoint,
  memesIdLikesUserIdDeleteEndpoint,
  memesIdLikesUserIdGetEndpoint,
  memesIdLikesUserIdPutEndpoint,
  memesIdsPutEndpoint,
  memesSearchEndpoint,
} from "./endpoints/meme-endpoints/memeCalls";
import { metadataInfoEndpoint } from "./endpoints/metadataCall";

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
    windowMs: 1000,
    limit: 10, // 10 req per sec
    handler: async (req, res, next, options) => {
      console.log("Rate Limit Called!!");
      // Setting timeouts
      await supabase
        .from("Memes")
        .select()
        .abortSignal(AbortSignal.timeout(1000 * 30));

      await supabase
        .from("Users")
        .select()
        .abortSignal(AbortSignal.timeout(1000 * 30));

      const statusCode = options?.statusCode ?? 429;
      res
        .status(statusCode)
        .send("Too many Requests! Try again after 30 seconds!! 🤓");
      return AbortSignal.timeout(1000 * 30);
    },
  }),

  slowDown({
    windowMs: 1000, // Time to remember request, so requests will be in memory for 1 seconds
    // basically, 10 requests per second or the requests will be rate limited
    delayAfter: 10,
    delayMs: () => 1000 * 30, // base is 30 seconds, but after 10 requests, the time will increment by 10 seconds
    maxDelayMs: 1000 * 60,
  })
);

// ERROR HANDLING!!
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    console.error(err);
    res.status(err.status || 500).json({ success: false, error: err });
  }
  next();
  return;
});

app.use(apiKeyAuth);

// INFO ENDPOINT!!
metadataInfoEndpoint(app, baseUrl);

// MEME ENDPOINTS!!!
memesGetEndpoint(app, baseUrl);

memesPostEndpoint(app, baseUrl);

getByMemeIds(app, baseUrl);

memesIdsPutEndpoint(app, baseUrl);

memesIdLikesGetEndpoint(app, baseUrl);

memesIdLikesUserIdGetEndpoint(app, baseUrl);

memesIdLikesUserIdDeleteEndpoint(app, baseUrl);

memesIdLikesUserIdPutEndpoint(app, baseUrl);

memesSearchEndpoint(app, baseUrl);

// USER ENDPOINTS!!!
getUsers(app, baseUrl);

postUsers(app, baseUrl);

getByUserId(app, baseUrl);

getByUsername(app, baseUrl);

deleteByUserId(app, baseUrl);

putByUserId(app, baseUrl);

getLikedMemesByUserId(app, baseUrl);

getLikedMemeByUserId(app, baseUrl);

getFriends(app, baseUrl);

getFriendByUserId(app, baseUrl);

deleteFriend(app, baseUrl);

newFriend(app, baseUrl);

getFriendRequestType(app, baseUrl);

getRequestByTarget(app, baseUrl);

deleteFriendRequest(app, baseUrl);

newFriendRequest(app, baseUrl);
/**
 * 8/24/2025 01:16
 * May have to use regex to include the optional parameters of the endpoints
 *
 */

app.get("/test", (req, res, next) => {
  console.log("Test endpoint called!! 🤯");
  res.json({ success: true, message: "The ONE PIECE IS REAL!!! 🧔🏼" });
  next();
  return;
});

app.get("/", (res: Response) => {
  res.json({ message: "Welcome to the Express + TypeScript Server!" });
});

// Start the Express server
app.listen(port, () => {
  console.log(`The server is running at http://localhost:${port}`);
});

export default app;
