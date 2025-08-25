import { NextFunction, Request, Response } from "express";
import { supabase } from "../../supabase-init.ts";
import { app, baseUrl } from "../../index.ts";

export function memesIdsPutEndpoint(
  req: Request,
  res: Response,
  next: NextFunction
) {}

export function memesIdLikesGetEndpoint(
  req: Request,
  res: Response,
  next: NextFunction
) {}

export function memesIdLikesUserIdGetEndpoint(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Since this exists, likes is most likely an array of user ids, but the likes
  // get endpoitn only returns the length of that column
}

export function memesIdLikesUserIdDeleteEndpoint(
  req: Request,
  res: Response,
  next: NextFunction
) {}

export function memesIdLikesUserIdPutEndpoint(
  req: Request,
  res: Response,
  next: NextFunction
) {}

/**
 * First escape regex with:
 * const escapeRegex = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
 *
 * Then create an instance of the RegExp class
 * with the constructor arguments of: escapeRegex and "i"
 *
 * This looks like this:
 * const regex = new RegExp(escapeRegex, "i");
 *
 */
export function memesSearchEndpoint(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { match, regexMatch } = req.params;
}

class MemeEndpoints {
  memesIdsGetEndpoint(next: NextFunction) {}
}
