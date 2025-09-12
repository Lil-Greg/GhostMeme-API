import { NextFunction, Request, Response } from "express";
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

export function getByMemeIds(app, baseUrl) {
  // limit fetches as 10 per sec
  /*
    Cannot use the slowdown or ratelimit because they have to be used at app
    initialization
   */
  app.get(
    baseUrl + "/memes/:meme_id/{*splat}",
    async (req: Request, res: Response, next: NextFunction) => {
      // how can I get each meme id, get in order, and check them.

      // splat is an array
      const { meme_id, splat } = req.params;

      const memeIds = [meme_id, ...splat];
      const result: Meme[] = [];

      for (let memeId of memeIds) {
        const { data, error, status } = await supabase
          .from("Memes")
          .select()
          .eq("meme_id", parseInt(memeId));

        if (error) {
          res.status(status).json({
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

      next();
      return;
    }
  );
}
