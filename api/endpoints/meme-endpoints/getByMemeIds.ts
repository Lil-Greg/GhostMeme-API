import { NextFunction } from "express";
import { app, baseUrl } from "../..";
import { supabase } from "../../supabase-init";
import { Meme } from "../../../libs/types/memeTypes";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";

/**
 * /memes/:meme_id1/:meme_id2/.../:meme_idN (GET)
 *
 * https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/meme-endpoints/memes-meme-id-1-meme-id-2-meme-id-n-get
 */

export function getByMemeIds(res, req, next: NextFunction) {
  // limit fetches as 10 per sec
  const limiter = slowDown({
    windowMs: 1000 * 1,
    delayAfter: 10,
    delayMs: 500,
    maxDelayMs: 1000 * 1,
  });
  app.get(baseUrl + "/memes/:meme_id/*splat", limiter, async (req, res) => {
    console.log("Inside getByMemeIds");
    // how can I get each meme id, get in order, and check them.

    const { meme_id, splat } = req.params;

    const memeIds = [meme_id, ...splat.split("/")];
    const result: Meme[] = [];

    for (let memeId of memeIds) {
      const { data } = await supabase
        .from("Memes")
        .select()
        .eq("meme_id", parseInt(memeId));

      if (!data) {
        res.status(404).json({
          success: false,
          error: `There is an undefined meme_id within the path, potentially at position number ${
            result.length + 1
          }.`,
        });
        next();
        return;
      }
      result.push(...data);
    }

    res.json({
      success: true,
      memes: result,
    });
  });

  next();
}
